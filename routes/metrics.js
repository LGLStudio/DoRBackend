const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    console.log("triggered !")
    const metrics = req.body;

    console.log('Métriques reçues:', metrics);

    res.status(200).json({ message: 'Métriques reçues avec succès' });
});

module.exports = router;
