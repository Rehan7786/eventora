const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load configuration before importing modules that read environment variables
// (for example the Razorpay client).
dotenv.config();

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const eventRoutes = require('./routes/event');                
const { razorpayWebhook } = require('./controllers/bookingController');


const app = express();
app.use(cors());
// Razorpay signs the exact request bytes, so this route must receive a raw body
// before the JSON parser runs.
app.post('/api/bookings/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);
app.use(express.json());

//routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);           

const port = process.env.PORT || 3000;

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be configured');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('Unable to start server:', error.message);
  process.exitCode = 1;
});
