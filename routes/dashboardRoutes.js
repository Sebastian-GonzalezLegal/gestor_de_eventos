const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, DashboardController.getStats);

module.exports = router;
