const express = require('express');
const router = express.Router();
const signsController = require('../controllers/signsController');

router.get('/', signsController.getAllSigns);
router.get('/:id', signsController.getSignById);

module.exports = router;
