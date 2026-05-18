const express = require('express');
const db = require('../dbConfig');
const path = require('path');
const coockieParser = require('cookie-parser');

const port = 3002;

require('../utils/cronJobs');

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(coockieParser());
router.use(express.static(path.join(__dirname, '..', 'public')));
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');


//Server
router.listen(port, () => {
    console.log(`Server is lesten http://localhost:${port}`);

});

//DB Connected
db.connect((err) => {
    if (err) {
        console.error("Database connection faild:", err.massage);
    } else {
        console.log("Connction to my SQL database.");
    }
});

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
router.get('/e', authMiddleware, (req,res)=>{
    res.sendFile(path.join(__dirname,'..', 'public', 'Views', 'EditPage.html'));
});

//File - ChngePass.html
router.get('/changePass', authMiddleware,(req,res)=>{
    res.sendFile(path.join(__dirname,'..','public','Views','ChngePass.html'));
});

//Register page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'Register.html'));
});

//----------------------------------------------------------PATHS----------------------------------------------------------

//USER
router.post('/',userController.login);
router.get('/getUser', authMiddleware, userController.getUser);
router.post('/register', userController.createProfile);
router.post('/changePass', authMiddleware, userController.changePass);
router.put('/updateLog/:id', authMiddleware, userController.updateLog);
router.delete('/deleteLog/:id', authMiddleware, userController.deleteLog);

//RELATIVE
router.post('/addChild', authMiddleware, userController.addChild);
router.get('/getChildren', authMiddleware, userController.getChildren);

//GUARDIAN
router.post('/addGuardian',authMiddleware, userController.addGuardian);
router.get('/getGuardian',authMiddleware, userController.getGuardian);
router.post('/addChildGuardian',authMiddleware, userController.addChildGuardian);

//MEDICATION
router.post('/addMedication',authMiddleware, userController.addMedication);
router.post('/addMedicationType',authMiddleware, userController.addMedicationType);
router.get('/getMedications',authMiddleware, userController.getMedications);

//LOGS
router.get('/getLogs',authMiddleware, userController.getLogs);

//TEST
router.get('/testMailer', userController.testMailer);