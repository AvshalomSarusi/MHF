const db = require('../dbConfig');
const messages = require('../utils/message');
const sendMail = require('../utils/mailer');
const { validateEmail, validatePassword } = require('../utils/patterns');
const formatName = require('../utils/formatName');
const User = require('../models/User');
const Guardian = require('../models/Guardian');
// const Relative = require('../models/Child');
// const Medication = require('../models/Medication');

//USER
exports.createProfile = (req, res) => {

    let msg;
    let user;

    const { name, last, email, pass } = req.body;

    if (!name || !last || !email || !pass) {
        return res.status(400).send("Missing required fields");
    }

    try {
        user = new User(name, last, pass, email)
    } catch (error) {
        return res.status(400).send(error.message);
    }

    // בדיקה אם האימייל כבר קיים
    const checkSql = `SELECT * FROM users WHERE email = '${user.getEmail()}'`;

    db.query(checkSql, (checkErr, checkResult) => {
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
        VALUES ('${user.getFirstName()}', '${user.getLastName()}', '${pass}', '${user.getEmail()}')`;

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

exports.changePass = (req, res) => {

    let msg;

    const userId = req.userId;

    const { name, lname, email, pass1, pass2 } = req.body;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!name || !lname || !email || !pass1 || !pass2) {
        return res.status(400).send("Missing required fields");
    }

    if (pass1 === pass2) {
        return res.status(400).send("New password must be different from old password");
    }

    if (!validateEmail(email)) {
        return res.status(400).send("Invalid email format");
    }

    if (!validatePassword(pass2)) {
        return res.ststus(400).send("Invalid new password format");
    }

    const checkDetails = `SELECT * FROM users WHERE id ='${userId}'`;

    db.query(checkDetails, (err, result) => {
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

        const updateSql = `UPDATE users SET password='${pass2}' WHERE email='${email}'`;

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

exports.login = (req, res) => {

    const { nickname, pass } = req.body;

    if (!formatName(nickname)) {
        throw new Error("Invalid nickname format");
    }
    if (!validatePassword(pass)) {
        throw new Error("Invalid password format");
    }

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

            res.cookie('mhf_user', result[0].id, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                sameSite: 'strict'
            });

            res.redirect('/p');
        } else {
            res.send("Incorrect username or password.");
        }
    });
};

exports.updateLog = (req, res) => {

    const userId = req.userId;
    const logId = req.params.id;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    const { dosage, scheduled_time } = req.body;

    if (!dosage || !scheduled_time) {
        return res.status(400).send("Missing required fields");
    }

    const sql = `
        UPDATE linkingtable
        SET dosage = '${dosage}',
            scheduled_time = '${scheduled_time}'
        WHERE id = '${logId}'
        AND user_id = '${userId}'
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Update failed");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Record not found");
        }

        res.send("Updated successfully");

    });
};

exports.getUser = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    const sql =
        `SELECT firstname
    FROM users
    WHERE id = '${userId}'`;

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("DB error.");
        }

        if (result.length === 0) {
            return res.status(404).send("User not found");
        }

        res.json(result[0]);
    });
};

exports.deleteLog = (req, res) => {

    const userId = req.cookies.mhf_user;
    const logId = req.params.id;

    if (!userId) {
        return res.status(401).send("Not logged in.");
    }

    const getChildSql = `
        SELECT child_id
        FROM linkingtable
        WHERE id = '${logId}'
        AND user_id = '${userId}'
    `;

    db.query(getChildSql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("DB error");
        }

        if (result.length === 0) {
            return res.status(404).send("Task not found");
        }

        const childId = result[0].child_id;

        const deleteLogSql = `
            DELETE FROM linkingtable
            WHERE id = '${logId}'
            AND user_id = '${userId}'
        `;

        db.query(deleteLogSql, (err2) => {

            if (err2) {
                console.log(err2);
                return res.status(500).send("Delete task failed");
            }

            const deleteGuardianLinkSql = `
                DELETE FROM child_guardian
                WHERE child_id = '${childId}'
                AND user_id = '${userId}'
            `;

            db.query(deleteGuardianLinkSql, (err3) => {

                if (err3) {
                    console.log(err3);
                    return res.status(500).send("Delete guardian link failed");
                }

                res.send("Task deleted successfully");
            });
        });
    });
};

exports.sendGuardianMessage = (req, res) => {

    const userId = req.userId;
    const guardianId = req.body.guardianId;
    const subject = req.body.subject;
    const message = req.body.message;

    console.log(guardianId);

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!guardianId || !subject || !message) {
        return res.status(400).send("Missing message datails");
    }

    const sql = `
    SELECT *
    FROM guardian
    WHERE id = '${guardianId}'
    AND user_id = '${userId}'`;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("DB Error");
        }

        if (result.length === 0) {
            return res.status(404).send("Guardian not found");
        }

        const guardian = result[0];
        const fullMessage = `
        ${message}
        
        --------------------------------------------
        This email was sent through the MHF website.`;

        sendMail(
            guardian.email,
            subject,
            fullMessage
        );

        res.send("Message sent successfuly");
    });
}
//CHILD
exports.addChild = (req, res) => {

    const userId = req.userId;
    let { name } = req.body;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!name) {
        return res.send("Name is required.");
    }

    name = formatName(name);

    const sql =
        `INSERT INTO childe (user_id, name)
        VALUES ('${userId}','${name}')`;

    db.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }

        res.send("Relative added successfuly.");
    });
};

exports.getChildren = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    const sql =
        `SELECT id,name FROM childe WHERE user_id = '${userId}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error.");
        }

        res.json(result);
    });
};

exports.deleteRelative = (req, res) => {

    const userId = req.userId;
    const relativeId = req.params.id;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!relativeId) {
        return res.satatus(400).send("Missing relative");
    }

    const deleteRelative = `
    DELETE FROM childe
    WHERE id ='${relativeId}'
    AND user_id='${userId}'`;

    db.query(deleteRelative, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Delete relative failed");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Relative not found");
        }

        res.send("Relative deleted successfuly");
    });
};

//GUARDIAN
exports.addGuardian = (req, res) => {

    const userId = req.userId;
    const { name, relationship, email } = req.body;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!name || !relationship || !email) {
        return res.status(400).send("Missing required fields");
    }

    let guardian;

    try {
        guardian = new Guardian(userId, name, relationship, email);
    } catch (error) {
        return res.status(400).send(error.message);
    }

    const checkSql =
        `SELECT * FROM guardian
        WHERE email = '${guardian.getEmail()}'
        AND user_id = '${userId}'`;

    db.query(checkSql, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("DB error.");
        }

        if (result.length > 0) {
            return res.status(409).send("Guardian already exists.");
        }

        const insertSql =
            `INSERT INTO guardian (user_id, name, relationship, email)
            VALUES ('${userId}','${guardian.getName()}','${guardian.getRelationship()}','${guardian.getEmail()}')`;

        db.query(insertSql, (err2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send("DB error.");
            }

            res.send("Guardian added successfully");
        });
    });
};

exports.getGuardian = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    const sql = `SELECT id, name From guardian WHERE user_id = '${userId}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("DB error");
        }
        res.json(result);
    });
};

exports.addChildGuardian = (req, res) => {

    const userId = req.userId;
    const { child_id, guardian_id } = req.body;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!child_id || !guardian_id) {

        return res.send("Missing data");
    }

    const checkSql =
        `SELECT *
        FROM child_guardian
        WHERE child_id = '${child_id}'
        AND guardian_id = '${guardian_id}'
        AND user_id = '${userId}'`;

    db.query(checkSql, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("BD check error");
        }
        if (result.length > 0) {
            return res.send("Guardian already linked to this relative");
        }
        const insertSql =
            `INSERT INTO child_guardian (user_id, child_id, guardian_id)
        VALUES ('${userId}','${child_id}','${guardian_id}')`;

        db.query(insertSql, (err) => {
            if (err) {
                console.log("DB insert error");
            }
            res.send("Guardian linked successfuly");

        });
    });
};

exports.deleteGuardian = (req, res) => {

    const userId = req.userId;
    const guardianId = req.params.id;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!guardianId) {
        return res.status(400).send("Missing guardian");
    }
    const deleteGuardianSql = `
        DELETE FROM guardian
        WHERE id ='${guardianId}'
        AND user_id='${userId}'`;

    db.query(deleteGuardianSql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Delete guardian failed");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Guardian not found");
        }

        res.send("Guardian deleted successfully");
    });
};

//LOGS
exports.getLogs = (req, res) => {

    const userId = req.cookies.mhf_user;

    if (!userId) {
        return res.status(401).send("Not logged in.");
    }

    const sql =
        `SELECT
        linkingtable.id,
        childe.name AS child_name,
        medications.name AS medication_name,
        linkingtable.dosage,
        linkingtable.scheduled_time,
        guardian.name AS guardian_name
        FROM linkingtable
        JOIN childe
        ON linkingtable.child_id = childe.id
        LEFT JOIN child_guardian
        ON linkingtable.child_id = child_guardian.child_id
        JOIN medications
        ON linkingtable.medication_id = medications.id
        LEFT JOIN guardian
        ON child_guardian.guardian_id = guardian.id
        WHERE linkingtable.user_id = '${userId}'`;

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("DB error");
        }

        res.json(results);
    });
    console.log("GET LOGS RUNNING");
};

exports.confirmMedication = (req, res) => {

    const token = req.query.token;

    if (!token) {
        return res.status(400).send("Missing confirmation token");
    }

    const checkTokenSql = `
    SELECT *
    FROM medication_confirm_tokens
    WHERE token = '${token}'`;

    db.query(checkTokenSql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("DB Error");
        }

        if (result.length === 0) {
            return res.status(404).send("Invalid confirmation link");
        }

        const tokenData = result[0];

        if (tokenData.used === 1) {
            return res.status(400).send("This confirmation link has used");
        }

        const now = new Date();
        const expiresAt = new Date(tokenData.expires_at);

        if (now > expiresAt) {
            return res.status(400).send("This confirmation link has expired");
        }

        const getDosageSql = `
        SELECT dosage
        FROM linkingtable
        WHERE user_id = '${tokenData.user_id}'
        AND child_id = '${tokenData.child_id}'
        AND medication_id = '${tokenData.medication_id}'
        LIMIT 1`;

        db.query(getDosageSql, (err, dosageResult) => {

            if (err) {
                console.log(err);
                return res.status(500).send("Failed to get medication dosage");
            }

            if (dosageResult.length === 0) {
                return res.status(404).send("Medication task not found");
            }

            const realDosage = dosageResult[0].dosage;

            const insertSql = `
            INSERT INTO data_medications
            (user_id, id_c, id_m, id_g, amount, date, time)
            VALUES
            ('${tokenData.user_id}', '${tokenData.child_id}', '${tokenData.medication_id}',
             '${tokenData.guardian_id}', '${realDosage}', CURDATE(), CURTIME())`;

            db.query(insertSql, (err, insertResult) => {

                if (err) {
                    console.log(err);
                    return res.status(500).send("Failed to save medication confirmation");
                }

                const updateTokenSql = `
                UPDATE medication_confirm_tokens
                SET used = 1
                WHERE id = '${tokenData.id}'`;

                db.query(updateTokenSql, (err, updateResult) => {

                    if (err) {
                        console.log(err);
                        return res.status(500).send("Confirmation saved, but token update failed");
                    }

                    res.send(`
                    <h2>Medication confirmed successfuly</h2>
                    <p>Thank you. the confirmation was saved in the MHF system.</p>
                    `);
                });
            });
        });
    });
};

//MEDICATION
exports.addMedication = (req, res) => {

    const userId = req.userId;
    const { child_id, medication, dosage, timeToSend } = req.body;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!child_id || !medication || !dosage || !timeToSend) {
        return res.send("All fields are required");
    }

    const medication_id = medication;

    const insertLog = `
        INSERT INTO linkingtable
        (user_id, child_id, medication_id, dosage, scheduled_time)
        VALUES (${userId}, ${child_id}, ${medication_id},'${dosage}', '${timeToSend}')
    `;

    db.query(insertLog, (err) => {

        if (err) {
            console.log("INSERT LOG ERROR:", err);
            return res.send("Insert error");
        }

        res.send("Medication added");
    });
};

exports.getMedications = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    const sql = `SELECT id, name FROM medications WHERE user_id = '${userId}'`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("DB error");
        res.json(results);
    });
};

exports.addMedicationType = (req, res) => {

    const userId = req.userId;
    const { name, antibiotic } = req.body;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!name) {
        return res.send("Medication name required");
    }

    let fixedName = formatName(name);
    const checkSql = `
        SELECT * FROM medications
        WHERE name = '${fixedName}'
        AND user_id = '${userId}'`;

    db.query(checkSql, (err, results) => {

        if (err) {
            console.log(err);
            return res.send("DB check error");
        }

        if (results.length > 0) {
            return res.send(`${name} already exists`);
        }

        const insertSql = `
            INSERT INTO medications (user_id, name, antibiotics)
            VALUES ('${userId}','${fixedName}', '${antibiotic}')`;

        db.query(insertSql, (err2) => {

            if (err2) {
                console.log(err2);
                return res.send("DB insert error");
            }

            res.send("Medication added successfully");
        });
    });
};

exports.deleteMedication = (req, res) => {

    const userId = req.userId;
    const medicationId = req.params.id;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    if (!medicationId) {
        return res.status(400).send("Missing medication");
    }

    const deleteMedicationSql = `
        DELETE FROM medications
        WHERE id ='${medicationId}'
        AND user_id = '${userId}'`;

    db.query(deleteMedicationSql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Delete medication medication failed");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Medication not found");
        }

        res.send("Medication deleted successfully");
    });
};

exports.getMedicationHistory = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("No logged in");
    }

    const sql = `
        SELECT
        data_medications.id,
        childe.name AS child_name,
        medications.name AS medication_name,
        guardian.name AS given_by,
        data_medications.amount,
        data_medications.\`date\` AS given_date,
        data_medications.\`time\` AS given_time

        FROM data_medications

        JOIN childe
        ON data_medications.id_c = childe.id

        JOIN medications
        ON data_medications.id_m = medications.id

        LEFT JOIN guardian
        ON data_medications.id_g = guardian.id

        WHERE data_medications.user_id = '${userId}'

        ORDER BY data_medications.\`date\` DESC,
                 data_medications.\`time\` DESC

        LIMIT 30`;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("DB error");
        }

        res.json(result);
    });
};

//TEST
exports.testMailer = (req, res) => {

    sendMail(
        "myEmail@gmail.com",
        "Test from MHF",
        "It worked"
    )
    res.send("Mail sent");
};
