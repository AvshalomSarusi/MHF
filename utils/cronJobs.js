const cron = require('node-cron');
const db = require('../dbConfig');
const sendMail = require('./mailer');
const message = require('../utils/message');
const crypto = require('crypto');

//בודק כל דקה
cron.schedule('* * * * *', () => {

    console.log("Cron checking medications...");

    const now = new Date();

    const currentTime =
        now.getHours().toString().padStart(2, '0') +
        ":" +
        now.getMinutes().toString().padStart(2, '0');

    console.log(`CRON CHECKING NOW: ${currentTime}`);

    const sql = `
        SELECT
        linkingtable.id,
        linkingtable.user_id,
        linkingtable.child_id,
        linkingtable.medication_id,
        child_guardian.guardian_id,
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

        WHERE TIME_FORMAT(linkingtable.scheduled_time, '%H:%i') = ?`;

    db.query(sql, [currentTime], (err, results) => {

        if (err) {
            console.log("CRON DB ERROR:", err);
            return;
        }

        if (results.length === 0) {
            return;
        }

        results.forEach(row => {

            const token = crypto.randomBytes(32).toString('hex');
            const today = new Date().toISOString().slice(0, 10);
            const batchId = `${row.id}_${row.scheduled_time}_${today}`;

            const insertTokenSql = `
                INSERT INTO medication_confirm_tokens
                (task_id, batch_id, token, user_id, child_id, medication_id, guardian_id, amount, expires_at)
                VALUES
                (
                    '${row.id}',
                    '${batchId}',
                    '${token}',
                    '${row.user_id}',
                    '${row.child_id}',
                    '${row.medication_id}',
                    '${row.guardian_id}',
                    '${row.dosage}',
                    DATE_ADD(NOW(), INTERVAL 24 HOUR)
                )
            `;

            db.query(insertTokenSql, (err, tokenResult) => {

                if (err) {
                    console.log("TOKEN INSERT ERROR:", err);
                    return;
                }

                const confirmLink = `http://localhost:3002/confirmMedication?token=${token}`;

                // the confirmation button is built INTO the message (single HTML
                // block) so the mail client doesn't split it off as "quoted text"
                const msg = message.medicationReminder(
                    row.guardian_name,
                    row.child_name,
                    row.medication_name,
                    row.dosage,
                    currentTime,
                    confirmLink
                );

                sendMail(
                    row.guardian_email,
                    msg.subject,
                    msg.text,
                    msg.html
                );

                console.log("Token created:", token);
                console.log("Reminder sent to:", row.guardian_email);
            });
        });
    });

}, {
    timezone: "Asia/Jerusalem"
});