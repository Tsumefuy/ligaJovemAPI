var express = require('express');
var router = express.Router();

const teacherController = require('../controllers/teacher_controller');

router
    .get('/api/rooms', roomsController.controller);

module.exports = router;