// controllers/userController.js
const db = require('../config/firebase');

// Mettre à jour les skins d'un utilisateur
exports.updateUserSkins = async (req, res) => {
    const userId = req.params.id;
    const { skins } = req.body;

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Vérifier si l'utilisateur a le droit de modifier les skins
        // Cette vérification dépend de votre logique d'application, par exemple :
        // if (userId !== req.user.id) {
        //   return res.status(403).json({ message: 'Not authorized' });
        // }

        // Mettre à jour les skins de l'utilisateur
        await userRef.update({ skins });

        return res.status(200).json({ message: 'Skins updated successfully' });
    } catch (error) {
        console.error('Error updating skins:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
