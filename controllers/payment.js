// création des sessions de paiement.
const stripe = require('../config/stripe');

exports.createCheckoutSession = async (req, res) => {
    const {uid} = req.body; // ID PaymentMethod

    if (!uid) {
        return res.status(400).send({error: 'UID is required'});
    }

    const userId = req.user.uid;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Ecopoco',
                        },
                        unit_amount: 1000, // TODO
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                userId: userId,
            },
        });

        res.json({id: session.id});
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({error: error.message});
    }
};
