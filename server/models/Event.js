const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: false,
        index: true
    },
    state: {
        type: String,
        required: false,
        index: true
    },
    area: {
        type: String,
        required: false,
        index: true
    },
    category: {
        type: String,
        required: true
    },
    totalSeats: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    ticketPrice: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
