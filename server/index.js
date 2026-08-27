const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const eventRoutes = require('./routes/event');                
const { razorpayWebhook } = require('./controllers/bookingController');

dotenv.config();


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

mongoose.connect(process.env.MONGO_URI, {
  
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));




const port = process.env.PORT || 3000


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 
