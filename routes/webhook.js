//  gère les événements webhook envoyés par Stripe.

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook');

router.post('/webhook', express.raw({ type: 'application/json' }), webhookController.handleWebhook);

module.exports = router;
