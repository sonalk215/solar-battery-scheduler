const express = require('express');
const router = express.Router();
const { getJobs, assignJob } = require('../controllers/jobsController');

// const installerController = require('../controllers/installersController');

router.get('/', getJobs);
router.post('/assign', assignJob);

module.exports = router;
