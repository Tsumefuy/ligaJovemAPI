var express = require('express');
var router = express.Router();

const authController = require('../controllers/auth_controller');

router
    .get('/api/rooms', async (req, res) => authController);

module.exports = router;