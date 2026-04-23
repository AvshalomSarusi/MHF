const db = require('../dbConfig');

function createProfile(req, res) {
    const { name, last, email, pass } = req.body;

    if (!name || !last || !email || !pass) {
        return res.status(400).send("Missing required fields");
    }

    const sql = `INSERT INTO users (firstname, lastname, password, email)
    VALUES ('${name}', '${last}', '${pass}', '${email}')`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("DB error");
        }
        
        sendMail(
            req.body.email,
            "Welcome to MHF",
            `Hello,
        
        Welcome to MHF.
        
        Your account has been created successfully.
        You can now log in and start using the system.
        
        We wish you a smooth and helpful experience.
        
        Thank you,
        MHF Team
        
        
        ------------------------
        
        ,שלום
        
        .MHFברוך הבא ל־ 
        
        .החשבון שלך נוצר בהצלחה 
        .כעת ניתן להתחבר ולהתחיל להשתמש במערכת 
        
        .מאחלים לך שימוש נוח ומועיל 
        
        ,תודה 
        MHF צוות `
        );
    
        res.send("User created");

        setTimeout(() => {
            res.redirect('/');
        }, 2000);
    });
}

module.exports = {
    createProfile   
};