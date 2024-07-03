const stripe = require('../config/stripe');
const User = require('../models/User');

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.WEBHOOK_SIGNING_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email = session.customer_details.email;

        const user = await User.findOne({email});
        if (user) {
            user.coins += 100; // TODO Ajoutez le nombre de coins achetés
            await user.save();
        }
    }

    res.status(200).json({received: true});
};
