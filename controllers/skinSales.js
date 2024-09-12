const db = require('../config/firebase');

exports.createSkinSale = async (req, res) => {
    const {skin_property_id, user_seller, price_without_commission} = req.body;
    const userId = req.userId;

    if (!skin_property_id || user_seller === undefined || price_without_commission === undefined) {
        return res.status(400).send({error: 'Skin ID, price without commission, and fee are required'});
    }

    try {
        const skinPropertyRef = db.db.collection('skin_properties').doc(skin_property_id);
        const skinPropertyDoc = await skinPropertyRef.get();

        if (!skinPropertyDoc.exists) {
            return res.status(404).send({error: 'Skin not found or user does not own the skin'});
        }

        const skinPropertyData = skinPropertyDoc.data();
        if (skinPropertyData.is_on_sale) {
            return res.status(400).send({error: 'Skin is already on sale'});
        }

        await skinPropertyRef.update({is_on_sale: true});

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

exports.buySkinSale = async (req, res) => {
    const { skin_sale_id, user_buyer_id } = req.body;
    const userId = req.userId;

    const skinSaleId = req.params.id;
    if (!skinSaleId) {
        return res.status(400).send({ error: `Missing skin sale ID ${req}` });
    }

    if (!skin_sale_id || !user_buyer_id) {
        return res.status(400).send({ error: 'Missing buyer ID or skin sale ID' });
    }

    return res.status(200).send({ ok_gros: `on a Req : ${req} et Res ${res}` });

    try {
        const skinSaleRef = db.db.collection('skin_sales').doc(skin_sale_id);
        const skinSaleDoc = await skinSaleRef.get();

        if (!skinSaleDoc.exists) {
            return res.status(404).send({ error: 'Skin sale not found' });
        }

        const skinSaleData = skinSaleDoc.data();
        const { user_seller, price_without_commission, fee, skin_property } = skinSaleData;
        const skinPropertyId = skin_property.id;
        const skin_total_price = price_without_commission + (price_without_commission * fee / 100);

        const userBuyerRef = db.db.collection('users').doc(user_buyer_id);
        const userBuyerDoc = await userBuyerRef.get();

        if (!userBuyerDoc.exists) {
            return res.status(404).send({ error: 'Buyer not found' });
        }

        const userBuyerData = userBuyerDoc.data();
        if (userBuyerData.coins < skin_total_price) {
            return res.status(400).send({ error: "Not enough coins to complete the purchase" });
        }

        const skinPropertyRef = db.db.collection('skin_properties').doc(skinPropertyId);
        const skinPropertyDoc = await skinPropertyRef.get();

        if (!skinPropertyDoc.exists) {
            return res.status(404).send({ error: 'Skin property not found' });
        }

        await skinPropertyRef.update({
            user: db.db.doc(`users/${user_buyer_id}`),
            is_on_sale: false
        });

        await userBuyerRef.update({
            coins: userBuyerData.coins - skin_total_price
        });

        const userSellerRef = db.db.collection('users').doc(user_seller.id);
        const userSellerDoc = await userSellerRef.get();

        if (userSellerDoc.exists) {
            const userSellerData = userSellerDoc.data();

            const updatedSellerSkins = (userSellerData.skins || []).filter(skin => skin.path !== skinPropertyRef.path);

            await userSellerRef.update({
                coins: (userSellerData.coins || 0) + price_without_commission,
                skins: updatedSellerSkins
            });
        }

        const updatedBuyerSkins = [...(userBuyerData.skins || []), skinPropertyRef];
        await userBuyerRef.update({
            skins: updatedBuyerSkins
        });

        await skinSaleRef.update({
            user_buyer: db.db.doc(`users/${user_buyer_id}`),
            date_transaction: new Date().toISOString()
        });

        res.status(200).send({ message: 'Skin purchased successfully' });
    } catch (error) {
        console.error('Error purchasing skin:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};




