const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/auth');

const {
  bookEvent,
  getMyBookings,
  confirmBooking,
  cancelBooking,
  sendBookingOtp,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/bookingController');

router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendBookingOtp);
router.get('/my', protect, getMyBookings);
router.put('/:id/confirm', protect, admin, confirmBooking);
router.delete('/:id', protect, cancelBooking);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyRazorpayPayment);

module.exports = router;
