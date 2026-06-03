const express = require('express');
const path = require('path');
const router = express.Router();

const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const sendMail = require('../utils/mailer');

//----------------------------------------------------------PAGES----------------------------------------------------------

//File - AdminPage
router.get('/a', authMiddleware, (req, res) => {

    if (req.role !== 'admin') {

        const userId = req.userId;

        const userSql = `
            SELECT id, firstname, lastname, email, role
            FROM users
            WHERE id = '${userId}'
        `;

        db.query(userSql, (err, userResult) => {

            if (err) {
                console.log(err);
                return res.status(500).send("DB Error");
            }

            if (userResult.length === 0) {
                return res.status(403).send("Access denied");
            }

            const user = userResult[0];

            const adminSql = `
                SELECT email
                FROM users
                WHERE role = 'admin'
            `;

            db.query(adminSql, (err2, adminResult) => {

                if (err2) {
                    console.log(err2);
                    return res.status(500).send("DB Error");
                }

                const subject = "Security Alert - Unauthorized Admin Page Access Attempt";

                const text = `
                Security Alert

                A non-admin user tried to access the admin page.

                User details:
                ID: ${user.id}
                First name: ${user.firstname}
                Last name: ${user.lastname}
                Email: ${user.email}
                Role: ${user.role}

                Attempt details:
                Page: /a
                Date: ${new Date().toLocaleString()}
                IP: ${req.ip}

                This email was sent automatically by the MHF system.`;

                adminResult.forEach(admin => {
                    sendMail(admin.email, subject, text);
                });

                return res.status(403).send("Access denied");
            });
        });

        return;
    }

    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'AdminPage.html'));
});

//File - LoginPage.html
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'LoginPage.html'));
});

//File - ProfilePage.html
router.get('/p', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'ProfilePage.html'));
});

//File - EditPage.html
router.get('/e', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'EditPage.html'));
});

//File - HistoryPage.html
router.get('/h', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'HistoryPage.html'));
});

//File - GuardianMessages.html
router.get('/gm', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'GuradianMessages.html'));
});

//File - ChngePass.html
router.get('/changePass', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'ChngePass.html'));
});

//Register page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'Register.html'));
});

//----------------------------------------------------------PATHS----------------------------------------------------------

router.get('/home', authMiddleware, (req, res) => {

    if (req.role === 'admin') {
        return res.redirect('/a');
    }

    res.redirect('/p');
});

router.get('/getRole', authMiddleware, (req, res) => {
    res.json({ role: req.role })
});

router.get('/logout', (req, res) => {
    res.clearCookie('mhf_user');
    res.redirect('/');
});

//USER
router.post('/', userController.login);
router.post('/register', userController.createProfile);
router.get('/getUser', authMiddleware, userController.getUser);
router.post('/changePass', authMiddleware, userController.changePass);
router.put('/updateLog/:id', authMiddleware, userController.updateLog);
router.delete('/deleteLog/:id', authMiddleware, userController.deleteLog);
router.post('/sendGuardianMessage', authMiddleware, userController.sendGuardianMessage);
router.get('/getMedicationHistory', authMiddleware, userController.getMedicationHistory);

//RELATIVE
router.post('/addChild', authMiddleware, userController.addChild);
router.get('/getChildren', authMiddleware, userController.getChildren);
router.delete('/deleteRelative/:id', authMiddleware, userController.deleteRelative);

//GUARDIAN
router.post('/addGuardian', authMiddleware, userController.addGuardian);
router.get('/getGuardian', authMiddleware, userController.getGuardian);
router.post('/addChildGuardian', authMiddleware, userController.addChildGuardian);
router.delete('/deleteGuardian/:id', authMiddleware, userController.deleteGuardian);

//MEDICATION
router.post('/addMedication', authMiddleware, userController.addMedication);
router.post('/addMedicationType', authMiddleware, userController.addMedicationType);
router.get('/getMedications', authMiddleware, userController.getMedications);
router.delete('/deleteMedication/:id', authMiddleware, userController.deleteMedication);

//LOGS
router.get('/getLogs', authMiddleware, userController.getLogs);
router.get('/confirmMedication', userController.confirmMedication);

//TEST
router.get('/testMailer', userController.testMailer);

module.exports = router;