const db = require('../dbConfig');
const messages = require('../public/JS/message');
const sendMail = require('../public/JS/mailer');

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
        
        const msg = messages.welcome(name);

        sendMail(
            email,
            msg.subject,
            msg.text
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