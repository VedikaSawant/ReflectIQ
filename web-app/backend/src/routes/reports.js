const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/download', reportsController.downloadReport);

module.exports = router;
