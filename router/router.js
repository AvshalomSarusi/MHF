const express = require('express');
const db = require('../dbConfig');
const path = require('path');
const port = 3002;

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const LogDir = router.use(express.static(path.join(__dirname,'..','public')));
const userController = require('../controller/userController');

router.listen(port, () => {
    console.log(`Server is lesten http://localhost:${port}`);
    
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
    res.sendFile(path.join(__dirname,'..','public','Views', 'LoginPage.html'));
});

//בודק שם המשתמש והסיסמא מול הדאטה בייס
router.post('/', (req, res) => {
    const { nickname, pass } = req.body;

    // שאלה לדאטאבייס כדי לבדוק אם יש את המשתמש עם הסיסמה הזו

    console.log({nickname});
    const query = `SELECT * FROM users WHERE username = '${nickname}' AND password = '${pass}'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database query failed:", err.message);
            return res.status(500).send("Database query failed");
        }

        if (results.length > 0) {
            // אם יש תוצאה, המשתמש קיים והסיסמה נכונה
            res.send("Connected successfully.");
            //alert("Connected successfully.");
        } else {
            // אם אין תוצאה, שם המשתמש או הסיסמה לא נכונים
            res.send("Incorrect username or password.");
            //alert("Incorrect username or password.");
        }
    });
});

// יצירת פרופיל חדש 
router.post('/register',userController.createUser);