const db = require('../dbConfig');

function authMiddleware(req, res, next) {

    const userId = req.cookies.mhf_user;
    let role = "";
    
    if (!userId) {
        return res.redirect('/');
    }

    const sql = `
    SELECT role
    FROM users
    WHERE id = '${userId}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("DB Error");
        }

        if (result.length === 0) {
            return res.redirect('/');
        }
        req.role = result[0].role;
        req.userId = userId;
        
        next();
    });

}

module.exports = authMiddleware;