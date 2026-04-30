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
        
    const sql = `
        SELECT 
            l.id,
            l.dosage,
            l.scheduled_time,
            c.name AS child_name,
            m.name AS medication_name,
            u.email,
            u.firstname
        FROM linkingtable l
        JOIN childe c ON l.child_id = c.id
        JOIN medications m ON l.medication_id = m.id
        JOIN users u ON l.given_by = u.id
        WHERE TIME_FORMAT(l.scheduled_time, '%H:%i') = ?
    `;

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