// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');


const app = express();

app.use(cors());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Replace 'http://localhost:3000' with your frontend origin


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mediconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
