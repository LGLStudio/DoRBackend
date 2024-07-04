// controllers/webhook.js
const stripe = require('../config/stripe');
const {db} = require('../config/firebase');

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            // credit ecopocos
            await handleCheckoutSessionCompleted(session);
            break;
        // handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
};

const handleCheckoutSessionCompleted = async (session) => {
    const userId = session.metadata.userId;

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log('No such user!');
            return;
        }

        const userData = userDoc.data();
        const newCoins = (userData.coins || 0) + 100;

        await userRef.update({coins: newCoins});

        console.log(`Updated coins for user ${userId}: ${newCoins}`);
    } catch (error) {
        console.error('Error updating user coins:', error);
    }
};