const express = require('express');
const router = express.Router();
const skinSalesController = require('../controllers/skinSales');

// Routes CRUD
// router.get('/', skinSalesController.getSkins);
// router.get('/:id', skinSalesController.getSkin);
router.post('/', skinSalesController.createSkinSale);
// router.put('/:id', skinSalesController.updateSkin);
// router.delete('/:id', skinSalesController.deleteSkin);

module.exports = router;
