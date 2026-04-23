const express = require('express');
const db = require('../dbConfig');
const path = require('path');
const port = 3002;

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const LogDir = router.use(express.static(path.join(__dirname, '..', 'public')));
const userController = require('../controller/userController');
const sendMail = require('../public/JS/mailer');

let currentUser = null;

router.listen(port, () => {
    console.log(`Server is lesten http://localhost:${port}`);

});

// דף הפרופיל
router.get('/p', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'ProfilePage.html'));
});

// דף ההרשמה
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'Register.html'));
});

//חיבור הדאטה
db.connect((err) => {
    if (err) {
        console.error("Database connection faild:", err.massage);
    } else {
        console.log("Connction to my SQL database.");
    }
});

//הצגת דף הכניסה שלי
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'Views', 'LoginPage.html'));
});

//בודק שם המשתמש והסיסמא מול הדאטה בייס
router.post('/', (req, res) => {
    const { nickname, pass } = req.body;

    // שאלה לדאטאבייס כדי לבדוק אם יש את המשתמש עם הסיסמה הזו
    console.log({ nickname });
    const query = `SELECT * FROM users WHERE firstname = '${nickname}' AND password = '${pass}'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database query failed:", err.message);
            return res.status(500).send("Database query failed");
        }

        if (results.length > 0) {
            // אם יש תוצאה, המשתמש קיים והסיסמה 
            currentUser = results[0];
            res.redirect('/p');
        } else {
            // אם אין תוצאה, שם המשתמש או הסיסמה לא נכונים
            res.send("Incorrect username or password.");
        }
    });
});

//הדאטה בייס מחזיר את פרטי המשתמש המחובר
router.get('/getUser', (req, res) => {
    if (!currentUser) {
        return res.status(401).send("Not logged in");
    }

    const sql = `SELECT firstname FROM users WHERE id = ${currentUser.id}`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send("DB error");
        }

        res.json(results[0]);
    });
});

// יצירת פרופיל חדש 
router.post('/register', userController.createProfile);

//הכנסת ילד או בן משפחה אחר לדאטה בייס
router.post('/addChild', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.send("Name is required");
    }

    const sql = `INSERT INTO childe (name) VALUES ('${name}')`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("DB error");
        }
        console.log({ name })
        res.send("Child added successfully");
    });
});

//בדיקה שהכול עובד נכון עם שליחת האימיילים
router.get('/testMailer', (req, res) => {

    sendMail(
        "myEmail@gmail.com",
        "Test from MHF",
        "It worked"
    )
    res.send("Mail sent");
})