const db = require('../dbConfig');
const messages = require('../utils/message');
const sendMail = require('../utils/mailer');

let currentUser = null;

function createProfile(req, res) {

    let msg;

    const { name, last, email, pass } = req.body;

    if (!name || !last || !email || !pass) {
        return res.status(400).send("Missing required fields");
    }

    // בדיקה אם האימייל כבר קיים
    const checkSql = `SELECT * FROM users WHERE email = ?`;

    db.query(checkSql, [email], (checkErr, checkResult) => {
        if (checkErr) {
            console.log(checkErr);
            return res.status(500).send("DB error");
        }

        // אם נמצא משתמש עם אותו אימייל
        if (checkResult.length > 0) {

            const existingName = checkResult[0].firstname;

            msg = messages.securityEmailAlreadyExists(existingName);

            sendMail(
                email,
                msg.subject,
                msg.text
            );

            return res.status(400).send(messages.emailAlreadyExists);

        }

        // אם האימייל פנוי - ממשיכים הרשמה
        const sql = `INSERT INTO users (firstname, lastname, password, email)
        VALUES ('${name}', '${last}', '${pass}', '${email}')`;

        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("DB error");
            }

            msg = messages.welcome(name);

            sendMail(
                email,
                msg.subject,
                msg.text
            );

            res.send("User created");
        });
    });
};

function changePass(req, res) {

    let msg;

    const { name, lname, email, pass1, pass2 } = req.body;

    if (!name || !lname || !email || !pass1 || !pass2) {
        return res.status(400).send("Missing required fields");
    }

    if (pass1 === pass2) {
        return res.status(400).send("New password must be different from old password");
    }

    const checkDetails = `SELECT * FROM users WHERE email =?`;

    db.query(checkDetails, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("DB Error");
        }

        if (result.length === 0) {
            return res.status(404).send("User not found");
        }

        const user = result[0];

        if (name !== user.firstname || lname !== user.lastname || pass1 !== user.password) {
            return res.status(400).send("One or more of your details are incorrect");
        }

        const updateSql = `UPDATE users SET password='${pass2}' WHERE email=?`;

        db.query(updateSql, [email], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Password update failed");
            }

            msg = messages.passwordChanged(name);

            sendMail(
                email,
                msg.subject,
                msg.text
            );

            res.send(messages.passChange);
        });
    });
};

function login(req, res) {
    const { nickname, pass } = req.body;

    const sql =
        `SELECT * FROM users
    WHERE firstname = '${nickname}'
    AND password = '${pass}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }

        if (result.length > 0) {
            currentUser = result[0];
            res.redirect('/p');
        } else {
            res.send("Incorrect username or password.");
        }
    });
};

function getUser(req, res) {

    if (!currentUser) {
        return res.status(401).send("Not logged in.");
    }

    const sql =
        `SELECT firstname
    FROM users
    WHERE id = '${currentUser.id}'`;

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("DB error.");
        }

        res.json(result[0]);
    });
};

function addChild(req, res) {

    const { name } = req.body;

    if (!name) {
        return res.send("Name is required.");
    }

    const sql =
        `INSERT INTO childe (name)
    VALUES ('${name}')`;

    db.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }

        res.send("Relative added successfuly.");
    });
};

function getChildren(req, res) {

    const sql =
        `SELECT id,name FROM childe`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error.");
        }

        res.json(result);
    });
};

function addGuardian(req, res) {

    const { name, relationship, email } = req.body;

    if (!name || !relationship || !email) {
        return res.status(400).send("Missing required fields");
    }

    const checkSql =
        `SELECT * FROM guardian
    WHERE email = '${email}'`;

    db.query(checkSql, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("DB error.");
        }

        if (result.length > 0) {
            return res.status(409).send("Guardian already exists.");
        }

        const insertSql =
            `INSERT INTO guardian (name,relationship,email)
        VALUES ('${name}','${relationship}','${email}')`;

        db.query(insertSql, (err2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send("DB error.");
            }

            res.send("Guardian added successfully.");
        });
    });
};

function getGuardian(req, res) {
    const sql = `SELECT id, name From guardian`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("DB error");
        }
        res.json(result);
    });
};

function addChildGuardian(req, res) {
    const { child_id, guardian_id } = req.body;
    if (!child_id || !guardian_id) {
        return res.send("Missing data");
    }
    const checkSql =
        `SELECT *
    FROM child_guardian
    WHERE child_id = '${child_id}'
    AND guardian_id = '${guardian_id}'`;
    db.query(checkSql, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("BD check error");
        }
        if (result.length > 0) {
            return res.send("Guardian already linked to this relative");
        }
        const insertSql =
            `INSERT INTO child_guardian (child_id, guardian_id)
        VALUES ('${child_id}','${guardian_id}')`;

        db.query(insertSql, (err) => {
            if (err) {
                console.log("DB insert error");
            }
            res.send("Guardian linked successfuly");

        });
    });
};

function getLogs(req, res) {
    const sql =
        `SELECT 
        childe.name AS child_name,
        medications.name AS medication_name,
        COALESCE(users.firstname, 'Pending') AS given_by,
        linkingtable.mail_sent_at,
        linkingtable.given_at,
        linkingtable.dosage

        FROM linkingtable

        JOIN childe
        ON linkingtable.child_id = childe.id

        JOIN medications
        ON linkingtable.medication_id = medications.id

        LEFT JOIN users
        ON linkingtable.given_by = users.id`;

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("DB error");
        }

        res.json(results);
    });
    console.log("GET LOGS RUNNING");
};

function testMailer(req,res){

    sendMail(
        "myEmail@gmail.com",
        "Test from MHF",
        "It worked"
    )
    res.send("Mail sent");
};

function addMedication(req,res){
    const { child_id, medication, dosage, timeToSend } = req.body;

    if (!child_id || !medication || !dosage || !timeToSend) {
        return res.send("All fields are required");
    }

    const medication_id = medication;

    const insertLog = `
        INSERT INTO linkingtable
        (child_id, medication_id, given_by, dosage, scheduled_time)
        VALUES (${child_id}, ${medication_id}, ${currentUser.id}, '${dosage}', '${timeToSend}')
    `;

    db.query(insertLog, (err) => {

        if (err) {
            console.log("INSERT LOG ERROR:", err);
            return res.send("Insert error");
        }

        res.send("Medication added");
    });
};

function getMedications(req,res){
    const sql = `SELECT id, name FROM medications`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("DB error");
        res.json(results);
    });
};

function addMedicationType(req,res){
    const { name, antibiotic } = req.body;

    if (!name) {
        return res.send("Medication name required");
    }

    const checkSql = `
        SELECT * FROM medications
        WHERE name = '${name}'
    `;

    db.query(checkSql, (err, results) => {

        if (err) {
            console.log(err);
            return res.send("DB check error");
        }

        if (results.length > 0) {
            return res.send(`${name} already exists`);
        }

        const insertSql = `
            INSERT INTO medications (name, antibiotics)
            VALUES ('${name}', '${antibiotic}')
        `;

        db.query(insertSql, (err2) => {

            if (err2) {
                console.log(err2);
                return res.send("DB insert error");
            }

            res.send("Medication added successfully");
        });
    });
};

module.exports = {
    createProfile,
    changePass,
    login,
    getUser,
    addChild,
    getChildren,
    addGuardian,
    getGuardian,
    addChildGuardian,
    getLogs,
    testMailer,
    addMedication,
    addMedicationType,
    getMedications,
};