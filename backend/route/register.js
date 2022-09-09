const express = require('express');
const router = express.Router();
const { registerUser } = require('../controller/register');

router.route('/')
        .post(registerUser);

module.exports = router;