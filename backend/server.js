const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB()
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err.message));

// Load models
require('./models/User');
require('./models/Doctor');
require('./models/Appointment');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes')); // ✅ Correctly added

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'MediBook Healthcare API is running',
    status: 'OK'
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: err.message || 'Internal Server Error'
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏥 Server running on http://localhost:${PORT}`);
});