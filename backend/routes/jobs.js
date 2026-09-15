const express = require('express');
const router = express.Router();
const { getJobs } = require('../controllers/jobsController');

const installerController = require('../controllers/installersController');

router.get('/', getJobs);

module.exports = router;
