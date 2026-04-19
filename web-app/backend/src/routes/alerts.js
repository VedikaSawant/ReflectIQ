const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

router.get('/', alertsController.getAllAlerts);
router.get('/new', alertsController.getNewAlerts);

module.exports = router;
