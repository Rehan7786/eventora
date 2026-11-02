const Booking = require('../models/Booking');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');



const crypto = require('crypto');
const razorpay = require('../utils/razorpay');


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const signaturesMatch = (expected, actual) => {
    if (!actual || typeof actual !== 'string') return false;
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const actualBuffer = Buffer.from(actual, 'utf8');
    return expectedBuffer.length === actualBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};

const confirmCapturedPayment = async ({ orderId, paymentId }) => {
    // Atomically claim a pending booking so the checkout callback and webhook
    // cannot both deduct a seat for the same payment.
    const booking = await Booking.findOneAndUpdate(
        {
            razorpayOrderId: orderId,
            status: 'pending',
            razorpayPaymentId: { $exists: false },
        },
        {
            $set: {
                status: 'payment_processing',
                paymentStatus: 'paid',
                razorpayPaymentId: paymentId,
            },
        },
        { new: true },
    );

    if (!booking) {
        const existingBooking = await Booking.findOne({ razorpayOrderId: orderId });
        if (!existingBooking) return { state: 'not_found' };
        if (existingBooking.status === 'confirmed') return { state: 'confirmed', booking: existingBooking };
        return { state: 'processing', booking: existingBooking };
    }

    // The conditional update prevents concurrent payments from overselling seats.
    const event = await Event.findOneAndUpdate(
        { _id: booking.eventId, availableSeats: { $gt: 0 } },
        { $inc: { availableSeats: -1 } },
        { new: true },
    );

    if (!event) {
        booking.status = 'cancelled';
        await booking.save();
        return { state: 'sold_out', booking };
    }

    booking.status = 'confirmed';
    await booking.save();
    return { state: 'confirmed', booking };
};

exports.sendBookingOtp = async (req, res) => {
    try {
        const otp = generateOTP();
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
        await sendOTPEmail(req.user.email, otp, 'event_booking');
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteOne({ _id: validOTP._id }); // cleanup

        res.status(201).json({ message: 'Booking request submitted', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body; // 'paid' or 'not_paid'
        if (paymentStatus && !['paid', 'not_paid'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        // Claim the pending booking first. This stops two concurrent admin
        // requests from both confirming it and deducting two seats.
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, status: 'pending' },
            { $set: { status: 'payment_processing' } },
            { new: true },
        ).populate('userId').populate('eventId');

        if (!booking) {
            const existingBooking = await Booking.findById(req.params.id);
            if (!existingBooking) return res.status(404).json({ message: 'Booking not found' });
            return res.status(409).json({ message: 'Booking is no longer pending' });
        }

        // Atomically decrement inventory so separate bookings cannot oversell
        // the last remaining seat.
        const event = await Event.findOneAndUpdate(
            { _id: booking.eventId._id, availableSeats: { $gt: 0 } },
            { $inc: { availableSeats: -1 } },
            { new: true },
        );
        if (!event) {
            await Booking.findByIdAndUpdate(booking._id, { $set: { status: 'pending' } });
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();

        // Send email on admin confirmation
        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });
        if (booking.status === 'payment_processing') {
            return res.status(409).json({ message: 'Booking confirmation is in progress' });
        }

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }

};


exports.createRazorpayOrder = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        // Same OTP check as your existing bookEvent flow
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        if (event.ticketPrice === 0) {
            return res.status(400).json({ message: 'This event is free, use the regular booking endpoint' });
        }

        const amount = Math.round(Number(event.ticketPrice) * 100);
        if (!Number.isSafeInteger(amount) || amount < 100) {
            return res.status(400).json({ message: 'Ticket price must be at least ₹1' });
        }

        const order = await razorpay.orders.create({
            amount, // Razorpay expects the smallest currency unit (paise).
            currency: 'INR',
            // Razorpay limits receipt values to 40 characters. ObjectIds for
            // both the event and user would make the previous value 57 chars.
            receipt: `receipt_${eventId.slice(-8)}_${req.user.id.slice(-8)}_${Date.now().toString(36)}`,
        });

        // Reserve this specific order for this user and event. Payment verification
        // must use this record, rather than trusting an eventId supplied by the client.
        await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice,
            razorpayOrderId: order.id,
        });

        // Consume the OTP now so it can't be reused for a second order.
        await OTP.deleteOne({ _id: validOTP._id });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
            eventTitle: event.title,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment order', error: error.message });
    }
};

exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId } = req.body;

        const booking = await Booking.findOne({
            userId: req.user.id,
            eventId,
            razorpayOrderId: razorpay_order_id,
        });
        if (!booking) {
            return res.status(404).json({ message: 'Payment order was not found for this booking' });
        }

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            // Use the order ID stored by our server, never an untrusted value.
            .update(`${booking.razorpayOrderId}|${razorpay_payment_id}`)
            .digest('hex');

        if (!signaturesMatch(generatedSignature, razorpay_signature)) {
            return res.status(400).json({ message: 'Payment verification failed — signature mismatch' });
        }

        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        if (payment.order_id !== booking.razorpayOrderId || payment.status !== 'captured') {
            return res.status(400).json({ message: 'Payment has not been captured for this order' });
        }

        const result = await confirmCapturedPayment({
            orderId: booking.razorpayOrderId,
            paymentId: razorpay_payment_id,
        });
        if (result.state === 'sold_out') {
            return res.status(409).json({ message: 'Event sold out before payment could be confirmed. Please contact support for a refund.' });
        }
        if (result.state === 'not_found') {
            return res.status(404).json({ message: 'Payment order was not found' });
        }

        const isConfirmed = result.state === 'confirmed';
        res.status(isConfirmed ? 201 : 202).json({
            message: isConfirmed ? 'Payment verified, booking confirmed' : 'Payment received and is being confirmed',
            booking: result.booking,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.razorpayWebhook = async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return res.status(500).json({ message: 'RAZORPAY_WEBHOOK_SECRET is not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');

    if (!signaturesMatch(expectedSignature, signature)) {
        return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    try {
        const payload = JSON.parse(req.body.toString('utf8'));
        const payment = payload.payload?.payment?.entity;
        if (!payment || payment.status !== 'captured') {
            return res.status(200).json({ received: true });
        }

        const result = await confirmCapturedPayment({
            orderId: payment.order_id,
            paymentId: payment.id,
        });
        if (result.state === 'sold_out') {
            console.error(`Captured payment ${payment.id} could not be assigned because the event is sold out`);
        }
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Razorpay webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};
