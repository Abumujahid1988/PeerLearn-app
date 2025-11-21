const express = require('express');
const router = express.Router();
const { submit } = require('../controllers/contactController');

// POST /api/contact
router.post('/', submit);

module.exports = router;
