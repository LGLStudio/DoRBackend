// controllers/webhook.js
const stripe = require('../config/stripe');
const {db} = require('../config/firebase');

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        console.log("on va try l'event")
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Stripe event:", event)
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log("la session completed ", session)
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
    console.log("session finit !")
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

        console.log("fire userDoc = ", userDoc)
        console.log("fire userData = ", userData)

        await userRef.update({coins: newCoins});

        console.log(`Updated coins for user ${userId}: ${newCoins}`);
    } catch (error) {
        console.error('Error updating user coins:', error);
    }
};