const express = require('express');
const path = require('path');

const router = express.Router();

const db = require('../dbConfig');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controller/adminController');
//const sendMail = require('../utils/mailer');

//----------------------------------------------------------PAGES----------------------------------------------------------
//File - AdminPage
router.get('/a', authMiddleware, adminMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'AdminPage.html'));
});

//----------------------------------------------------------PATHS----------------------------------------------------------
router.post('/admin/runQuery', authMiddleware, adminMiddleware, adminController.runQuery );

module.exports = router;