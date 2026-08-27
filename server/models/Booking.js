const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'pending', 'payment_processing'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'not_paid'], default: 'not_paid' },
    amount: { type: Number, required: true },
    // Persist payment identifiers so a payment can only confirm its own booking once.
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    bookedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
