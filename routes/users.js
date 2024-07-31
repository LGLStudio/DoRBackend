const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// Route pour mettre à jour les skins d'un utilisateur
router.put('/:id/skins', userController.updateUserSkins);

module.exports = router;
