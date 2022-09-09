const express = require('express');
const router = express.Router();
const { createCar, queryCars } = require('../controller/car');

router.route('/')
        .post(createCar)
        .get(queryCars);

module.exports = router;