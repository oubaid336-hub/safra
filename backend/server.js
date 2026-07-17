require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const houseRoutes = require('./routes/houseRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

connectDB();

app.use(helmet());
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5500'; // ADMIN_MARKER_corsenv
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Safra API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wishlist', wishlistRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes); // ADMIN_MARKER_wire

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const faqRoutes = require('./routes/faqRoutes');
app.use('/api/faq', faqRoutes);

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes); // ADMIN_MARKER_part8wire

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

