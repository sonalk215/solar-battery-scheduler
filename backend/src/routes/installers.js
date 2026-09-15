const express = require('express');
const router = express.Router();

const installerController = require('../controllers/installersController');

router.get('/', installerController.getInstallers);

module.exports = router;
