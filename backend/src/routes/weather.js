const express = require('express');
const router = express.Router();
const { getWeatherRisk } = require('../controllers/weatherController');

router.get('/risk', getWeatherRisk);

module.exports = router;
