const express = require('express');
const db = require('../dbConfig');
const path = require('path');
const port = 3002;

require('../utils/cronJobs');

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const LogDir = router.use(express.static(path.join(__dirname, '..', 'public')));
const userController = require('../controller/userController');
const sendMail = require('../utils/mailer');

let currentUser = null;

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
router.get('/p', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'ProfilePage.html'));
});

//File - ChngePass.html
router.get('/changePass',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','public','Views','ChngePass.html'));
});

//Register page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'Register.html'));
});

//----------------------------------------------------------PATHS----------------------------------------------------------

//USER
router.post('/',userController.login);
router.get('/getUser',userController.getUser);
router.post('/register', userController.createProfile);
router.post('/changePass',userController.changePass);

//RELATIVE
router.post('/addChild',userController.addChild);
router.get('/getChildren',userController.getChildren);

//GUARDIAN
router.post('/addGuardian',userController.addGuardian);
router.get('/getGuardian',userController.getGuardian);
router.post('/addChildGuardian',userController.addChildGuardian);

//MEDICATION
router.post('/addMedication',userController.addMedication);
router.post('/addMedicationType',userController.addMedicationType);
router.get('/getMedications',userController.getMedications);

//LOGS
router.get('/getLogs',userController.getLogs);

//TEST
router.get('/testMailer',userController.testMailer);