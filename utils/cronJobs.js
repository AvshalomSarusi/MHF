const cron = require('node-cron');
const db = require('../dbConfig');
const sendMail = require('./mailer');
const message = require('../utils/message');

//בודק כל דקה
cron.schedule('* * * * *', () => {

    console.log("Cron checking medications...");

    const now = new Date();

    const currentTime =
        now.getHours().toString().padStart(2, '0')//אם האורך קטן מ2 תוסיף 0 בהתחלה לצורך הדוגמא אם 7 אז 07.
        +
        ":"
        +
        now.getMinutes().toString().padStart(2, '0');

    console.log(`CRON CHECKING NOW: ${currentTime}`);

    const sql = 
    `SELECT
    linkingtable.id,
    childe.name AS child_name,
    medications.name AS medication_name,
    linkingtable.dosage,
    linkingtable.scheduled_time,
    guardian.name AS guardian_name,
    guardian.email AS guardian_email

    FROM linkingtable

    JOIN childe
    ON linkingtable.child_id = childe.id

    JOIN medications
    ON linkingtable.medication_id = medications.id

    JOIN child_guardian
    ON linkingtable.child_id = child_guardian.child_id

    JOIN guardian
    ON child_guardian.guardian_id = guardian.id

    WHERE TIME_FORMAT(linkingtable.scheduled_time, '%H:%i') = ? `;

    db.query(sql, [currentTime], (err, results) => {

        if (err) {
            console.log("CRON DB ERROR:", err);
            return;
        }

        if (results.length === 0) {
            return;
        }

        results.forEach(row => {

            const msg = messages.medicationReminder(
                row.firstname,
                row.child_name,
                row.medication_name,
                row.dosage,
                currentTime
            );

            sendMail(
                row.email,
                msg.subject,
                msg.text
            );

            console.log("Reminder sent to:", row.email);

            const updateSql = `
                UPDATE linkingtable
                SET mail_sent_at = NOW()
                WHERE id = ?
            `;

            db.query(updateSql, [row.id], (updateErr) => {
                if (updateErr) {
                    console.log("MAIL UPDATE ERROR:", updateErr);
                }
            });

        });

    });

}, {
    timezone: "Asia/Jerusalem"
});