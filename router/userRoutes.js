const express = require('express');
const path = require('path');
const router = express.Router();

const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

//----------------------------------------------------------PAGES----------------------------------------------------------

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

//File - Register.html
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'Register.html'));
});

//File - ChildCard.html
router.get('/ccp',authMiddleware,(req,res)=>{
    res.sendFile(path.join(__dirname,'..','public','Views','ChildCard.html'));
})
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
    res.clearCookie('mhf_role');
    res.redirect('/');
});

//USER
router.post('/', userController.login);
router.post('/register', userController.createProfile);
router.get('/getUser', authMiddleware, userController.getUser);
router.post('/changePass', authMiddleware, userController.changePass);
router.put('/updateLog/:id', authMiddleware, userController.updateLog);
router.delete('/deleteLog/:id', authMiddleware, userController.deleteLog);
router.get('/childeCard/:name', authMiddleware, userController.getChildCard);
router.post('/sendGuardianMessage', authMiddleware, userController.sendGuardianMessage);
router.get('/getMedicationHistory', authMiddleware, userController.getMedicationHistory);

//RELATIVE
router.post('/addChild', authMiddleware, userController.addChild);
router.get('/getChildren', authMiddleware, userController.getChildren);
router.delete('/deleteRelative/:id', authMiddleware, userController.deleteRelative);
router.put('/updateChildData/:id', authMiddleware, userController.updateChildData);

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