// Shared RTL HTML wrapper for all emails, so Hebrew renders correctly and
// embedded left-to-right values (names, medications, numbers) don't get
// reordered by the mail client's bidi algorithm. Each value that may be in
// Latin/digits is isolated with <bdi>.
function shell(inner) {
    return `<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:#21302b;text-align:right;max-width:540px;margin:0 auto">${inner}</div>`;
}

const message = {

    welcome: (name) => ({
        subject: "ברוכים הבאים ל-MHF",
        text: `שלום ${name},

ברוכים הבאים ל-MHF.
חשבונך נוצר בהצלחה, וניתן כעת להתחבר ולהתחיל להשתמש במערכת.

אנו מאחלים לך חוויה נעימה ומועילה.

תודה,
צוות MHF`,
        html: shell(
            `<p>שלום <bdi>${name}</bdi>,</p>` +
            `<p>ברוכים הבאים ל-MHF.</p>` +
            `<p>חשבונך נוצר בהצלחה, וניתן כעת להתחבר ולהתחיל להשתמש במערכת.</p>` +
            `<p>אנו מאחלים לך חוויה נעימה ומועילה.</p>` +
            `<p>תודה,<br>צוות MHF</p>`
        ),
    }),


    emailAlreadyExists: "משתמש עם אימייל זה כבר רשום",


    securityEmailAlreadyExists: (name) => ({
        subject: "הודעת אבטחה – MHF",
        text: `שלום ${name},

לאחרונה בוצע ניסיון ליצור חשבון באמצעות כתובת אימייל זו.
ייתכן שמדובר בטעות. אם זה לא היה אתה, אנו ממליצים לבדוק את אבטחת חשבונך ולעדכן את הסיסמה במידת הצורך.

לשינוי הסיסמה: http://localhost:3002/changePass

צוות האבטחה של MHF`,
        html: shell(
            `<p>שלום <bdi>${name}</bdi>,</p>` +
            `<p>לאחרונה בוצע ניסיון ליצור חשבון באמצעות כתובת אימייל זו.</p>` +
            `<p>ייתכן שמדובר בטעות. אם זה לא היה אתה, אנו ממליצים לבדוק את אבטחת חשבונך ולעדכן את הסיסמה במידת הצורך.</p>` +
            `<p><a href="http://localhost:3002/changePass" style="color:#16715f">לחצו כאן לשינוי הסיסמה</a></p>` +
            `<p>צוות האבטחה של MHF</p>`
        ),
    }),

    passChange: "הסיסמה עודכנה בהצלחה",

    passwordChanged: (name) => ({
        subject: "הסיסמה שלך ב-MHF שונתה",
        text: `שלום ${name},

תודה על שיתוף הפעולה.
הסיסמה שלך שונתה בהצלחה. אם ביצעת עדכון זה, אין צורך בפעולה נוספת.
אם לא שינית את הסיסמה, אנו ממליצים בחום לבדוק את חשבונך באופן מיידי.

תודה,
צוות האבטחה של MHF`,
        html: shell(
            `<p>שלום <bdi>${name}</bdi>,</p>` +
            `<p>תודה על שיתוף הפעולה.</p>` +
            `<p>הסיסמה שלך שונתה בהצלחה. אם ביצעת עדכון זה, אין צורך בפעולה נוספת.</p>` +
            `<p>אם לא שינית את הסיסמה, אנו ממליצים בחום לבדוק את חשבונך באופן מיידי.</p>` +
            `<p>תודה,<br>צוות האבטחה של MHF</p>`
        ),
    }),

    medicationReminder: (name, childName, medicationName, dosage, time, confirmLink) => ({
        subject: `תזכורת MHF עבור ${childName}`,

        text: `שלום ${name},

הגיע הזמן לתת ל-${childName} את התרופה.

תרופה: ${medicationName}
מינון: ${dosage}
שעה: ${time}

לאישור שהילד קיבל את התרופה, היכנסו לקישור:
${confirmLink}

מערכת התזכורות של MHF`,
        // The confirmation button is part of this single block (not a second
        // appended block) so the mail client doesn't fold it into "quoted text".
        html: shell(
            `<p>שלום <bdi>${name}</bdi>,</p>` +
            `<p>הגיע הזמן לתת ל-<bdi>${childName}</bdi> את התרופה.</p>` +
            `<p style="margin:6px 0"><strong>תרופה:</strong> <bdi>${medicationName}</bdi></p>` +
            `<p style="margin:6px 0"><strong>מינון:</strong> <bdi>${dosage}</bdi></p>` +
            `<p style="margin:6px 0"><strong>שעה:</strong> <bdi>${time}</bdi></p>` +
            `<p style="margin-top:18px">לאישור שהילד קיבל את התרופה, לחצו על הכפתור:</p>` +
            `<p style="margin:6px 0 4px"><a href="${confirmLink}" style="background:#16715f;color:#ffffff;padding:12px 26px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">אישור נטילת התרופה</a></p>` +
            `<p style="margin-top:18px;color:#8a9389;font-size:13px">מערכת התזכורות של MHF</p>`
        ),
    }),
};

module.exports = message;
