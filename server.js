const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const dotenv = require('dotenv');
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');
const skinSalesRoutes = require('./routes/skinSales');

dotenv.config();


// Connect to database
connectDB();

// Middleware
const app = express();

// cors config
// app.use(cors({
//     origin: `${process.env.CLIENT_URL}`,
//     credentials: true, // cookies / sessions
// }));
//
// // Additional headers for CORS
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
//     res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     next();
// });
//
// app.use(bodyParser.json());
//
// // Handle preflight requests
// app.options('*', cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//     allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
//     methods: 'GET,HEAD,OPTIONS,POST,PUT'
// }));

app.use(cors());

// app.use(bodyParser.json());
// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook/stripe-webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});
app.use(bodyParser.urlencoded({extended: true}));


// Routes
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/skin-sales', skinSalesRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
