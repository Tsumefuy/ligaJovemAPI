var express = require('express');
var router = express.Router();

const roomsController = require('../controllers/rooms_controller');

router
    .get('/api/rooms', async (req, res) => roomsController);

module.exports = router;