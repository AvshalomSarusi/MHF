const express = require('express');
const path = require('path');

const router = express.Router();

const db = require('../dbConfig');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const sendMail = require('../utils/mailer');

//----------------------------------------------------------PAGES----------------------------------------------------------
//File - AdminPage
router.get('/a', authMiddleware, adminMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'AdminPage.html'));
});

module.exports = router;