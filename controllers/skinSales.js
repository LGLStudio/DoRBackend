const db = require('../config/firebase');

// Créer une nouvelle vente de skin
exports.createSkinSale = async (req, res) => {


    const {skin_property_id, user_seller, price_without_commission} = req.body;
    const userId = req.userId;

    if (!skin_property_id || user_seller === undefined || price_without_commission === undefined) {
        return res.status(400).send({error: 'Skin ID, price without commission, and fee are required'});
    }

    try {
        // Vérifiez si l'utilisateur possède le skin dans Skin_properties
        const skinPropertyRef = db.db.collection('skin_properties').doc(skin_property_id);
        const skinPropertyDoc = await skinPropertyRef.get();

        if (!skinPropertyDoc.exists) { // TODO vérifier que c'est le bon utilisateur qui possède le SKIN !
            return res.status(404).send({error: 'Skin not found or user does not own the skin'});
        }

        const skinPropertyData = skinPropertyDoc.data();
        if (skinPropertyData.is_on_sale) {
            return res.status(400).send({error: 'Skin is already on sale'});
        }

        // Marquer le skin comme étant en vente
        await skinPropertyRef.update({is_on_sale: true});

        // Créez la vente de skin
        const skinSaleRef = db.db.collection('skin_sales').doc();
        await skinSaleRef.set({
            skin_property: db.db.doc(`skin_properties/${skin_property_id}`),
            user_seller: db.db.doc(`users/${user_seller}`),
            price_without_commission: price_without_commission,
            fee: 10,
            date_on_sale: new Date().toISOString()
        });

        res.status(201).send({message: 'Skin sale created successfully', id: skinSaleRef.id});
    } catch (error) {
        console.error('Error creating skin sale:', error);
        res.status(500).send({error: 'Internal Server Error'});
    }
};
