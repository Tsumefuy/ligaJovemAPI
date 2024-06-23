var express = require('express');
var router = express.Router();

const teacherController = require('../controllers/teacher_controller');

router
    .get('/api/teacher', async (req, res) => teacherController);

module.exports = router;