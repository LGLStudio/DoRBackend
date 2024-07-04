// création des sessions de paiement.
const stripe = require('../config/stripe');
const {db} = require('../config/firebase');

exports.createCheckoutSession = async (req, res) => {
    const {uid, id} = req.body; // ID PaymentMethod

    if (!uid) {
        return res.status(400).send({error: 'UID is required'});
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).send({error: 'User not found'});
        }

        const userData = userDoc.data();

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
                userId: uid,
            },
        });

        res.json({id: session.id});

    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({error: error.message});
    }
};
