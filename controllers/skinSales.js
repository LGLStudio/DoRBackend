const db = require('../config/firebase');

// Créer une nouvelle vente de skin
exports.createSkinSale = async (req, res) => {
    const {skin_property_id, user_seller, price_without_commission} = req.body;
    const userId = req.userId;
    console.log("body = ", req.body)
    if (!skin_property_id || user_seller === undefined || price_without_commission === undefined) {
        return res.status(400).send({error: 'Skin ID, price without commission, and fee are required'});
    }

    try {
        // Vérifiez si l'utilisateur possède le skin dans Skin_properties
        const skinPropertyRef = db.collection('skin_properties').doc(skin_property_id);
        console.log("skinPropertyRef = ", skinPropertyRef)
        const skinPropertyDoc = await skinPropertyRef.get();

        if (!skinPropertyDoc.exists || skinPropertyDoc.data().User.id !== userId) {
            return res.status(404).send({error: 'Skin not found or user does not own the skin'});
        }

        const skinPropertyData = skinPropertyDoc.data();
        if (skinPropertyData.is_on_sale) {
            return res.status(400).send({error: 'Skin is already on sale'});
        }

        const skinId = skinPropertyDoc.data().Skin.id; // Référence au document dans skins


        // Marquer le skin comme étant en vente
        await skinPropertyRef.update({is_on_sale: true});

        // Créez la vente de skin
        const skinSaleRef = db.collection('skin_sales').doc();
        await skinSaleRef.set({
            Skin: db.doc(`skins/${skinId}`),
            User_Seller: db.doc(`users/${userId}`),
            Price_Without_Commission: price_without_commission,
            Fee: 10,
            Date_on_sale: new Date().toISOString()
        });

        res.status(201).send({message: 'Skin sale created successfully', id: skinSaleRef.id});
    } catch (error) {
        console.error('Error creating skin sale:', error);
        res.status(500).send({error: 'Internal Server Error'});
    }
};
