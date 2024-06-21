var express = require('express');
var router = express.Router();

const authController = require('../controllers/auth_controller');

router
    .get('/api/rooms', authController);

module.exports = router;