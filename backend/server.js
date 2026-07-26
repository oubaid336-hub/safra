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
app.set('trust proxy', 1);

connectDB();

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5500',
  'http://localhost:5500'
];
const lanOriginRegex = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)\d+\.\d+(:\d+)?$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || lanOriginRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta name="google-site-verification" content="IYX25PhS34ObQuO7mGTY-yPniHM7mGSktwXTZzKYWco" />
</head>
<body>Safra API is running</body>
</html>`);
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

const subscriberRoutes = require('./routes/subscriberRoutes');
app.use('/api/subscribers', subscriberRoutes);
const featuredRoutes = require('./routes/featured');
app.use('/api/featured', featuredRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



