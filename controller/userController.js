const db = require('../dbConfig');
const messages = require('../utils/message');
const sendMail = require('../utils/mailer');
const { validateEmail, validatePassword } = require('../utils/patterns');
const formatName = require('../utils/formatName');
const User = require('../models/User');
const Guardian = require('../models/Guardian');
const Child = require('../models/Child');
const Medication = require('../models/Medication');

// Styled RTL result page for the medication-confirmation link (opened in a browser
// from the reminder email). ok=true -> green success look, ok=false -> red error look.
function confirmPage(res, status, ok, title, subtitle) {
    res.status(status).send(`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MHF</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       font-family:Arial,Helvetica,sans-serif;color:#21302b;padding:24px;background:#f4f1ea;
       background-image:radial-gradient(1100px 520px at 12% -8%,#e2efe9 0%,transparent 60%),
                        radial-gradient(900px 480px at 108% 4%,#f6e5da 0%,transparent 55%);}
  .card{background:#fffdf8;border:1px solid #e4dfd2;border-radius:22px;
        box-shadow:0 18px 44px rgba(20,50,42,.16);max-width:440px;width:100%;
        padding:40px 30px;text-align:center}
  .badge{width:72px;height:72px;border-radius:50%;margin:0 auto 20px;display:flex;
         align-items:center;justify-content:center;font-size:40px;font-weight:bold;line-height:1}
  .ok{background:#e2efe9;color:#16715f}
  .err{background:#f6e0de;color:#b23b3b}
  h1{font-size:1.45rem;margin:0 0 12px;font-weight:700}
  p{color:#5d6b63;margin:0;line-height:1.7;font-size:1rem}
  .brand{margin-top:26px;color:#8a9389;font-size:.85rem}
</style>
</head>
<body>
  <div class="card">
    <div class="badge ${ok ? 'ok' : 'err'}">${ok ? '✓' : '!'}</div>
    <h1>${title}</h1>
    <p>${subtitle}</p>
    <div class="brand">My Healthy Family</div>
  </div>
</body>
</html>`);
}

//USER
exports.createProfile = (req, res) => {

    let msg;
    let user;

    const { name, last, email, pass } = req.body;

    if (!name || !last || !email || !pass) {
        return res.status(400).send("חסרים שדות חובה");
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
            return res.status(500).send("שגיאת מסד נתונים");
        }

        // אם נמצא משתמש עם אותו אימייל
        if (checkResult.length > 0) {

            const existingName = checkResult[0].firstname;

            msg = messages.securityEmailAlreadyExists(existingName);

            sendMail(
                email,
                msg.subject,
                msg.text,
                msg.html
            );

            return res.status(400).send(messages.emailAlreadyExists);

        }

        // אם האימייל פנוי - ממשיכים הרשמה
        const sql = `INSERT INTO users (firstname, lastname, password, email)
        VALUES ('${user.getFirstName()}', '${user.getLastName()}', '${pass}', '${user.getEmail()}')`;

        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("שגיאת מסד נתונים");
            }

            msg = messages.welcome(name);

            sendMail(
                email,
                msg.subject,
                msg.text,
                msg.html
            );

            res.send("המשתמש נוצר");
        });
    });
};

exports.changePass = (req, res) => {

    let msg;

    const userId = req.userId;

    const { name, lname, email, pass1, pass2 } = req.body;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!name || !lname || !email || !pass1 || !pass2) {
        return res.status(400).send("חסרים שדות חובה");
    }

    if (pass1 === pass2) {
        return res.status(400).send("הסיסמה החדשה חייבת להיות שונה מהישנה");
    }

    if (!validateEmail(email)) {
        return res.status(400).send("פורמט אימייל לא תקין");
    }

    if (!validatePassword(pass2)) {
        return res.status(400).send("פורמט הסיסמה החדשה לא תקין");
    }

    const checkDetails = `SELECT * FROM users WHERE id ='${userId}'`;

    db.query(checkDetails, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }

        if (result.length === 0) {
            return res.status(404).send("המשתמש לא נמצא");
        }

        const user = result[0];

        if (name !== user.firstname || lname !== user.lastname || pass1 !== user.password) {
            return res.status(400).send("אחד או יותר מהפרטים שלך שגויים");
        }

        const updateSql = `UPDATE users SET password='${pass2}' WHERE email='${email}'`;

        db.query(updateSql, [email], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("עדכון הסיסמה נכשל");
            }

            msg = messages.passwordChanged(name);

            sendMail(
                email,
                msg.subject,
                msg.text,
                msg.html
            );

            res.send(messages.passChange);
        });
    });
};

exports.login = (req, res) => {

    const { nickname, pass } = req.body;

    if (!nickname || !pass) {
        return res.status(400).send("חסרים פרטי התחברות");
    }
    if (!formatName(nickname)) {
        return res.status(400).send("פורמט שם משתמש לא תקין");
    }
    if (!validatePassword(pass)) {
        return res.status(400).send("פורמט סיסמה לא תקין");
    }

    const sql =
        `SELECT * FROM users
        WHERE firstname = '${nickname}'
        AND password = '${pass}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }

        if (result.length > 0) {

            res.cookie('mhf_user', result[0].id, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                sameSite: 'strict'
            });

            // readable (non-httpOnly) role cookie so a page can apply the admin
            // layout BEFORE first paint — prevents the layout "jump" on navigation.
            // real access is still enforced server-side via mhf_user + role checks.
            res.cookie('mhf_role', result[0].role, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                sameSite: 'strict'
            });

            res.redirect('/home');
        } else {
            res.status(401).send("שם משתמש או סיסמה שגויים.");
        }
    });
};

exports.updateLog = (req, res) => {

    const userId = req.userId;
    const logId = req.params.id;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    const { dosage, scheduled_time } = req.body;

    if (!dosage || !scheduled_time) {
        return res.status(400).send("חסרים שדות חובה");
    }

    if (!/^\d{2}:\d{2}$/.test(scheduled_time) && !/^\d{2}:\d{2}:\d{2}$/.test(scheduled_time)) {
        return res.status(400).send("פורמט שעה לא תקין");
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
            return res.status(500).send("העדכון נכשל");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("הרשומה לא נמצאה");
        }

        res.send("עודכן בהצלחה");

    });
};

exports.getUser = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    const sql =
        `SELECT firstname
    FROM users
    WHERE id = '${userId}'`;

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("שגיאת מסד נתונים.");
        }

        if (result.length === 0) {
            return res.status(404).send("המשתמש לא נמצא");
        }

        res.json(result[0]);
    });
};

exports.deleteLog = (req, res) => {

    const userId = req.cookies.mhf_user;
    const logId = req.params.id;

    if (!userId) {
        return res.status(401).send("לא מחוברים.");
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
            return res.status(500).send("שגיאת מסד נתונים");
        }

        if (result.length === 0) {
            return res.status(404).send("המשימה לא נמצאה");
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
                return res.status(500).send("מחיקת המשימה נכשלה");
            }

            const deleteGuardianLinkSql = `
                DELETE FROM child_guardian
                WHERE child_id = '${childId}'
                AND user_id = '${userId}'
            `;

            db.query(deleteGuardianLinkSql, (err3) => {

                if (err3) {
                    console.log(err3);
                    return res.status(500).send("מחיקת קישור האפוטרופוס נכשלה");
                }

                res.send("המשימה נמחקה בהצלחה");
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
        return res.status(401).send("לא מחוברים");
    }

    if (!guardianId || !subject || !message) {
        return res.status(400).send("חסרים פרטי הודעה");
    }

    const sql = `
    SELECT *
    FROM guardian
    WHERE id = '${guardianId}'
    AND user_id = '${userId}'`;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }

        if (result.length === 0) {
            return res.status(404).send("האפוטרופוס לא נמצא");
        }

        const guardian = result[0];
        const fullMessage = `${message}

--------------------------------------------
הודעה זו נשלחה דרך אתר MHF.`;

        const safeMessage = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>");

        const htmlMessage =
            `<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:#21302b;text-align:right;max-width:540px;margin:0 auto">` +
            `${safeMessage}` +
            `<hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0">` +
            `<span style="color:#777;font-size:13px">הודעה זו נשלחה דרך אתר MHF.</span>` +
            `</div>`;

        sendMail(
            guardian.email,
            subject,
            fullMessage,
            htmlMessage
        );

        res.send("ההודעה נשלחה בהצלחה");
    });
}
//CHILD
exports.addChild = (req, res) => {

    const userId = req.userId;
    let { name } = req.body;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!name) {
        return res.status(400).send("יש להזין שם.");
    }

    let child;

    try {
        child = new Child(userId, name);
    } catch (error) {
        return res.status(400).send(error.message);
    }

    const sql =
        `INSERT INTO childe (user_id, name)
        VALUES ('${child.getUserId()}','${child.getName()}')`;

    db.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }

        res.send("בן המשפחה נוסף בהצלחה.");
    });
};

exports.getChildren = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    const sql =
        `SELECT id,name FROM childe WHERE user_id = '${userId}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("שגיאת מסד נתונים.");
        }

        res.json(result);
    });
};

exports.deleteRelative = (req, res) => {

    const userId = req.userId;
    const relativeId = req.params.id;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!relativeId) {
        return res.status(400).send("חסר בן משפחה");
    }

    const checkTasksSql = `
        SELECT id
        FROM linkingtable
        WHERE child_id = ?
        AND user_id = ?
        LIMIT 1`;

    db.query(checkTasksSql, [relativeId, userId], (err, taskResult) => {

        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }

        if (taskResult.length > 0) {
            return res.status(409).send("לא ניתן למחוק בן משפחה. יש למחוק קודם את המשימה");
        }

        const deleteRelativeSql = `
            DELETE FROM childe
            WHERE id = ?
            AND user_id = ?`;

        db.query(deleteRelativeSql, [relativeId, userId], (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).send("מחיקת בן המשפחה נכשלה");
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("בן המשפחה לא נמצא");
            }

            res.send("בן המשפחה נמחק בהצלחה");
        });
    });
};

exports.updateChildData = (req, res) => {

    const userId = req.userId;
    const childId = req.params.id;
    const { weight, height } = req.body;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!childId) {
        return res.status(400).send("חסר מזהה בן משפחה");
    }

    if (!weight || !height) {
        return res.status(400).send("חסר משקל או גובה");
    }

    const weightNumber = Number(weight);
    const heightNumber = Number(height);

    if (isNaN(weightNumber) || isNaN(heightNumber)) {
        return res.status(400).send("משקל וגובה חייבים להיות מספרים");
    }

    const sql = `
        UPDATE childe
        SET weight = ?,
            height = ?
        WHERE id = ?
        AND user_id = ?
    `;

    db.query(sql, [weightNumber, heightNumber, childId, userId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("עדכון נתוני בן המשפחה נכשל");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("בן המשפחה לא נמצא");
        }

        res.send("נתוני בן המשפחה עודכנו בהצלחה");
    });
};

//GUARDIAN
exports.addGuardian = (req, res) => {

    const userId = req.userId;
    const { name, relationship, email } = req.body;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!name || !relationship || !email) {
        return res.status(400).send("חסרים שדות חובה");
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
            return res.status(500).send("שגיאת מסד נתונים.");
        }

        if (result.length > 0) {
            return res.status(409).send("האפוטרופוס כבר קיים.");
        }

        const insertSql =
            `INSERT INTO guardian (user_id, name, relationship, email)
            VALUES ('${userId}','${guardian.getName()}','${guardian.getRelationship()}','${guardian.getEmail()}')`;

        db.query(insertSql, (err2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send("שגיאת מסד נתונים.");
            }

            res.send("האפוטרופוס נוסף בהצלחה");
        });
    });
};

exports.getGuardian = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    const sql = `SELECT id, name From guardian WHERE user_id = '${userId}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }
        res.json(result);
    });
};

exports.addChildGuardian = (req, res) => {

    const userId = req.userId;
    const { child_id, guardian_id } = req.body;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!child_id || !guardian_id) {

        return res.status(400).send("חסרים נתונים");
    }

    const checkTaskSql = `
    SELECT child_id
    FROM linkingtable
    WHERE child_id = ?
    AND user_id = ?`;

    db.query(checkTaskSql, [child_id, userId], (err, taskResult) => {

        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }
        if (taskResult.length === 0) {
            return res.status(404).send("בן המשפחה לא נמצא בטבלת המשימות");
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
                return res.status(500).send("שגיאת בדיקת מסד נתונים");
            }
            if (result.length > 0) {
                return res.status(409).send("האפוטרופוס כבר משויך לבן משפחה זה");
            }
            const insertSql =
                `INSERT INTO child_guardian (user_id, child_id, guardian_id)
                 VALUES ('${userId}','${child_id}','${guardian_id}')`;

            db.query(insertSql, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("שגיאת הוספה למסד נתונים");
                }
                res.send("האפוטרופוס שויך בהצלחה");

            });
        });
    });
};

exports.deleteGuardian = (req, res) => {

    const userId = req.userId;
    const guardianId = req.params.id;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!guardianId) {
        return res.status(400).send("חסר אפוטרופוס");
    }

    const checkTasksSql = `
    SELECT guardian_id
    FROM child_guardian
    WHERE guardian_id = ?
    AND user_id = ? `;

    db.query(checkTasksSql, [guardianId, userId], (err, taskResult) => {
        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }
        if (taskResult.length > 0) {
            return res.status(409).send("לא ניתן למחוק אפוטרופוס. יש למחוק קודם את המשימה");
        }

        const deleteGuardianSql = `
        DELETE FROM guardian
        WHERE id = ?
        AND user_id= ?`;

        db.query(deleteGuardianSql, [guardianId, userId], (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).send("מחיקת האפוטרופוס נכשלה");
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("האפוטרופוס לא נמצא");
            }

            res.send("האפוטרופוס נמחק בהצלחה");
        });
    });
};

//LOGS
exports.getLogs = (req, res) => {

    const userId = req.cookies.mhf_user;

    if (!userId) {
        return res.status(401).send("לא מחוברים.");
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
            return res.status(500).send("שגיאת מסד נתונים");
        }

        res.json(results);
    });
    console.log("GET LOGS RUNNING");
};

exports.confirmMedication = (req, res) => {

    const token = req.query.token;

    if (!token) {
        return confirmPage(res, 400, false, "קישור לא תקין", "חסר טוקן אישור בקישור.");
    }

    const checkTokenSql = `
        SELECT *
        FROM medication_confirm_tokens
        WHERE token = '${token}'`;

    db.query(checkTokenSql, (err, result) => {

        if (err) {
            console.log(err);
            return confirmPage(res, 500, false, "אירעה שגיאה", "שגיאת מסד נתונים. נסו שוב מאוחר יותר.");
        }

        if (result.length === 0) {
            return confirmPage(res, 404, false, "קישור לא תקין", "קישור האישור אינו תקין.");
        }

        const tokenData = result[0];

        if (!tokenData.task_id) {
            return confirmPage(res, 400, false, "קישור לא תקין", "חסר מזהה משימה בקישור.");
        }

        if (tokenData.used === 1) {
            return confirmPage(res, 200, true, "התרופה כבר אושרה", "האישור עבור תרופה זו כבר נקלט במערכת.");
        }

        const now = new Date();
        const expiresAt = new Date(tokenData.expires_at);

        if (now > expiresAt) {
            return confirmPage(res, 400, false, "הקישור פג תוקף", "תוקף קישור האישור פג, ולא ניתן לאשר דרכו.");
        }

        const checkTaskConfirmedSql = `
        SELECT *
        FROM medication_confirm_tokens
        WHERE task_id = '${tokenData.task_id}'
        AND batch_id = '${tokenData.batch_id}'
        AND used = 1`;

        db.query(checkTaskConfirmedSql, (err, confirmedResult) => {

            if (err) {
                console.log(err);
                return confirmPage(res, 500, false, "אירעה שגיאה", "שגיאת מסד נתונים. נסו שוב מאוחר יותר.");
            }

            if (confirmedResult.length > 0) {
                return confirmPage(res, 200, true, "התרופה כבר אושרה", "האישור עבור תרופה זו כבר נקלט במערכת.");
            }

            const getDosageSql = `
                SELECT dosage
                FROM linkingtable
                WHERE id = '${tokenData.task_id}'
                AND user_id = '${tokenData.user_id}'
                LIMIT 1`;

            db.query(getDosageSql, (err, dosageResult) => {

                if (err) {
                    console.log(err);
                    return confirmPage(res, 500, false, "אירעה שגיאה", "נכשלה שליפת מינון התרופה.");
                }

                if (dosageResult.length === 0) {
                    return confirmPage(res, 404, false, "אירעה שגיאה", "משימת התרופה לא נמצאה.");
                }

                const childeNameSql = `
               SELECT name 
               FROM childe
               WHERE id = '${tokenData.child_id}'`

                db.query(childeNameSql, (err, childResult) => {
                    if (err) {
                        console.log(err);
                        return confirmPage(res, 500, false, "אירעה שגיאה", "שגיאת מסד נתונים. נסו שוב מאוחר יותר.");
                    }
                    if (childResult.length === 0) {
                        return confirmPage(res, 404, false, "אירעה שגיאה", "בן המשפחה לא נמצא.");
                    }


                    const guardianNameSql = `
                    SELECT name
                    FROM guardian
                    WHERE id = '${tokenData.guardian_id}'`;

                    db.query(guardianNameSql, (err, guardianResult) => {
                        if (err) {
                            console.log(err);
                            return confirmPage(res, 500, false, "אירעה שגיאה", "שגיאת מסד נתונים. נסו שוב מאוחר יותר.");
                        }
                        if (guardianResult.length === 0) {
                            return confirmPage(res, 404, false, "אירעה שגיאה", "האפוטרופוס לא נמצא.");
                        }



                        const medicationNameSql = `
                        SELECT name
                        FROM medications
                        WHERE id = '${tokenData.medication_id}'`;

                        db.query(medicationNameSql, (err, medicationResult) => {
                            if (err) {
                                console.log(err);
                                return confirmPage(res, 500, false, "אירעה שגיאה", "שגיאת מסד נתונים. נסו שוב מאוחר יותר.");
                            }
                            if (medicationResult.length === 0) {
                                return confirmPage(res, 404, false, "אירעה שגיאה", "התרופה לא נמצאה.");
                            }

                            const childName = childResult[0].name;
                            const guardianName = guardianResult[0].name;
                            const medicationName = medicationResult[0].name;
                            const realDosage = dosageResult[0].dosage;

                            const insertSql = `
                                INSERT INTO data_medications
                                (user_id, id_c, child_name, id_m, medication_name, id_g, guardian_name, amount, date, time)
                                VALUES
                                ('${tokenData.user_id}', '${tokenData.child_id}', '${childName}', '${tokenData.medication_id}',
                                 '${medicationName}', '${tokenData.guardian_id}', '${guardianName}', '${realDosage}', CURDATE(), CURTIME())`;

                            db.query(insertSql, (err, insertResult) => {

                                if (err) {
                                    console.log(err);
                                    return confirmPage(res, 500, false, "אירעה שגיאה", "שמירת אישור התרופה נכשלה.");
                                }

                                const updateTokenSql = `
                                UPDATE medication_confirm_tokens
                                SET used = 1
                                WHERE batch_id = '${tokenData.batch_id}'`;

                                db.query(updateTokenSql, (err, updateResult) => {

                                    if (err) {
                                        console.log(err);
                                        return confirmPage(res, 500, false, "אירעה שגיאה", "האישור נשמר, אך אירעה שגיאה בעדכון.");
                                    }

                                    return confirmPage(res, 200, true, "אישור התרופה בוצע בהצלחה", "תודה! האישור נשמר במערכת.");
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.getMedicationHistory = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    const sql = `
        SELECT
        id,
        child_name,
        medication_name,
        guardian_name AS given_by,
        amount,
        data_medications.\`date\` AS given_date,
        data_medications.\`time\` AS given_time

        FROM data_medications

        WHERE data_medications.user_id = '${userId}'

        ORDER BY data_medications.\`date\` DESC,
                 data_medications.\`time\` DESC

        LIMIT 30`;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }

        res.json(result);
    });
};

exports.getChildCard = (req, res) => {

    console.log("getChildCard function is running");

    const userId = req.userId;
    const childName = req.params.name;

    console.log("childName:", childName);
    console.log("userId:", userId);

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!childName) {
        return res.status(400).send("חסר מזהה בן משפחה");
    }

    const sql = `
    SELECT name, weight, height
    FROM childe
    WHERE  name = ?
    AND user_id = ?
    LIMIT 1`;

    db.query(sql, [childName, userId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }

        if (result.length === 0) {
            return res.status(404).send("בן המשפחה לא נמצא");
        }

        res.json(result[0]);
    });
};

//MEDICATION
exports.addMedication = (req, res) => {

    const userId = req.userId;
    const { child_id, medication, dosage, timeToSend } = req.body;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }
    if (dosage.length <= 0) {
        return res.status(400).send("המינון חייב להיות גדול מ-0");
    }
    if (!child_id || !medication || !dosage || !timeToSend) {
        return res.status(400).send("יש למלא את כל השדות");
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
            return res.status(500).send("שגיאת הוספה");
        }

        res.send("התרופה נוספה");
    });
};

exports.getMedications = (req, res) => {

    const userId = req.userId;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    const sql = `SELECT id, name FROM medications WHERE user_id = '${userId}'`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("שגיאת מסד נתונים");
        res.json(results);
    });
};

exports.addMedicationType = (req, res) => {

    const userId = req.userId;
    const { name, antibiotic } = req.body;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!name) {
        return res.status(400).send("יש להזין שם תרופה");
    }

    let medication;

    try {
        medication = new Medication(userId, name, antibiotic);
    } catch (error) {
        return res.status(400).send(error.message);
    }

    const fixedName = medication.getName();
    const checkSql = `
        SELECT * FROM medications
        WHERE name = '${fixedName}'
        AND user_id = '${userId}'`;

    db.query(checkSql, (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת בדיקת מסד נתונים");
        }

        if (results.length > 0) {
            return res.status(409).send(`${name} כבר קיימת`);
        }

        const insertSql = `
            INSERT INTO medications (user_id, name, antibiotics)
            VALUES ('${medication.getUserId()}','${medication.getName()}', '${medication.getAntibiotic()}')`;

        db.query(insertSql, (err2) => {

            if (err2) {
                console.log(err2);
                return res.status(500).send("שגיאת הוספה למסד נתונים");
            }

            res.send("התרופה נוספה בהצלחה");
        });
    });

};

exports.deleteMedication = (req, res) => {

    const userId = req.userId;
    const medicationId = req.params.id;

    if (!userId) {
        return res.status(401).send("לא מחוברים");
    }

    if (!medicationId) {
        return res.status(400).send("חסרה תרופה");
    }

    const checkTaskSql = `
    SELECT id
    FROM linkingtable
    WHERE medication_id = ?
    AND user_id = ?
    LIMIT 1`;

    db.query(checkTaskSql, [medicationId, userId], (err, taskResult) => {

        if (err) {
            console.log(err);
            return res.status(500).send("שגיאת מסד נתונים");
        }
        if (taskResult.length > 0) {
            return res.status(409).send("לא ניתן למחוק תרופה. יש למחוק קודם את המשימה")
        }

        const deleteMedicationSql = `
        DELETE FROM medications
        WHERE id ='${medicationId}'
        AND user_id = '${userId}'`;

        db.query(deleteMedicationSql, (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).send("מחיקת התרופה נכשלה");
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("התרופה לא נמצאה");
            }

            res.send("התרופה נמחקה בהצלחה");
        });
    });
};

//TEST
exports.testMailer = (req, res) => {

    sendMail(
        "myEmail@gmail.com",
        "Test from MHF",
        "It worked"
    )
    res.send("המייל נשלח");
};
