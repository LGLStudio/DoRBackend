// création des sessions de paiement.
const stripe = require('../config/stripe');
const {db} = require('../config/firebase');

exports.createCheckoutSession = async (req, res) => {
    console.log('Received body:', req.body);
    const {uid, id} = req.body; // ID PaymentMethod

    if (!uid) {
        console.log('UID is required');
        return res.status(400).send({error: 'UID is required'});
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log('User not found');
            return res.status(404).send({error: 'User not found'});
        }

        const userData = userDoc.data();
        console.log('User data:', userData);

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
