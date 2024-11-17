const express = require('express');
const { getFoodDetails } = require('../controllers/foodControllers');

const router = express.Router();

router.get('/food-details', getFoodDetails);

module.exports = router;
