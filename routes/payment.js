// gère la création des sessions de paiement.

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');

router.post('/create-checkout-session', paymentController.createCheckoutSession);

module.exports = router;
