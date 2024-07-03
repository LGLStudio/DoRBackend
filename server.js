const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const dotenv = require('dotenv');
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');

dotenv.config();


// Connect to database
connectDB();

// Middleware
const app = express();

// cors
app.use(cors({
    origin: `${process.env.CLIENT_URL}`,
    credentials: true, // cookies / sessions
}));

app.use(bodyParser.json());


// Routes
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
