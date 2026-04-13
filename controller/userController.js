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

        res.send("User created successfully");
    });
}

module.exports = {
    createProfile   // 🔥 אותו שם בדיוק
};