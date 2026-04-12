const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');

router.post('/chat', AIController.chat);
router.post('/check-alerts', AIController.checkAlerts);

module.exports = router;
