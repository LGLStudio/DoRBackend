// metrics.js
const express = require('express');
const router = express.Router();

// Initialisation des métriques
let totalRequests = 0;

// Endpoint reçoit les métriques du frontend
router.post('/', (req, res) => {
    totalRequests += 1;
    console.log('Métriques reçues:', req.body);
    res.status(200).json({ message: 'Métriques reçues avec succès' });
});

// Endpoint expose les métriques au format Prometheus
router.get('/prometheus-metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`# HELP frontend_get_requests_total Total number of page visits\n# TYPE frontend_get_requests_total counter\nfrontend_get_requests_total ${totalRequests}`);
});

module.exports = router;
