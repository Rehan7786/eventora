const Event = require('../models/Event');
const Booking = require('../models/Booking');

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

exports.getEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        if (req.query.search) filters.title = { $regex: req.query.search, $options: 'i' };
        if (req.query.country) filters.country = req.query.country;
        if (req.query.state) filters.state = req.query.state;
        if (req.query.area) filters.area = req.query.area;

        // Keep the original array response for existing consumers (such as the
        // admin dashboard), while allowing the public catalogue to opt into
        // paginated results with `page` and `limit`.
        const shouldPaginate = req.query.page || req.query.limit;
        if (shouldPaginate) {
            const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
            const [events, total] = await Promise.all([
                Event.find(filters)
                    .populate('createdBy', 'name email')
                    .sort({ date: 1 })
                    .skip((page - 1) * limit)
                    .limit(limit),
                Event.countDocuments(filters),
            ]);

            return res.json({
                events,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }

        const events = await Event.find(filters).populate('createdBy', 'name email').sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getOrganizerAnalytics = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id }).select('_id title totalSeats availableSeats');
        const eventIds = events.map((event) => event._id);
        const eventById = new Map(events.map((event) => [event._id.toString(), event]));
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const [summary, dailyRows, monthlyRows, popularRows] = await Promise.all([
            Booking.aggregate([
                { $match: { eventId: { $in: eventIds }, status: 'confirmed' } },
                {
                    $group: {
                        _id: null,
                        ticketsSold: { $sum: 1 },
                        revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } },
                    },
                },
            ]),
            Booking.aggregate([
                { $match: { eventId: { $in: eventIds }, createdAt: { $gte: sevenDaysAgo } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]),
            Booking.aggregate([
                { $match: { eventId: { $in: eventIds }, status: 'confirmed', paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
                { $sort: { _id: 1 } },
            ]),
            Booking.aggregate([
                { $match: { eventId: { $in: eventIds }, status: 'confirmed' } },
                { $group: { _id: '$eventId', ticketsSold: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } } } },
                { $sort: { ticketsSold: -1 } },
                { $limit: 5 },
            ]),
        ]);

        const dailyMap = new Map(dailyRows.map((row) => [row._id, row.count]));
        const dailyBookings = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(sevenDaysAgo);
            date.setDate(sevenDaysAgo.getDate() + index);
            const key = date.toISOString().slice(0, 10);
            return { label: date.toLocaleDateString('en-US', { weekday: 'short' }), bookings: dailyMap.get(key) || 0 };
        });

        const monthlyMap = new Map(monthlyRows.map((row) => [row._id, row.revenue]));
        const monthlyEarnings = Array.from({ length: 6 }, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
            return { label: date.toLocaleDateString('en-US', { month: 'short' }), revenue: monthlyMap.get(monthKey(date)) || 0 };
        });

        const totals = summary[0] || { ticketsSold: 0, revenue: 0 };
        res.json({
            revenue: totals.revenue,
            ticketsSold: totals.ticketsSold,
            availableSeats: events.reduce((total, event) => total + event.availableSeats, 0),
            totalEvents: events.length,
            dailyBookings,
            monthlyEarnings,
            popularEvents: popularRows.map((row) => ({
                title: eventById.get(row._id.toString())?.title || 'Deleted Event',
                ticketsSold: row.ticketsSold,
                revenue: row.revenue,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not load organizer analytics', error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, country, state, area, category, totalSeats, ticketPrice, image } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            location,
            country,
            state,
            area,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            image: image || '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
