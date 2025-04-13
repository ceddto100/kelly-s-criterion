const express = require('express');
const router = express.Router();
const marketOddsController = require('../controllers/marketOddsController');

// GET routes
router.get('/events', marketOddsController.getUpcomingEvents);
router.get('/:eventId/:marketType?', marketOddsController.getMarketOdds);

// POST routes
router.post('/update', marketOddsController.updateMarketOdds);
router.post('/compare', marketOddsController.compareOdds);

// Maintenance routes
router.delete('/cleanup', marketOddsController.cleanupOldOdds);

module.exports = router; 