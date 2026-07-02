const db = require('../dbConfig');

exports.runQuery = (req, res) => {

    if (req.role !== 'admin') {
        return res.status(403).send("הגישה נדחתה");
    }

    const { sqlQuery } = req.body;

    if (!sqlQuery) {
        return res.status(400).send("חסרה שאילתת SQL");
    }

    const cleanQuery = sqlQuery.trim();

    if (!/^select\s+/i.test(cleanQuery)) {
        return res.status(403).send("מותרות שאילתות SELECT בלבד");
    }

    db.query(cleanQuery, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("הרצת שאילתת ה-SQL נכשלה");
        }
        
        const safeResult = result.map(row => {
            const { password, ...rowWithoutPassword } = row;
            return rowWithoutPassword;
        });

        res.json(safeResult);
    });
};

exports.getDashboardStats  = (req, res) => {

    console.log("getDashboardStats in controler is run");
    const sql = `
        SELECT
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM childe) AS totalChildren,
        (SELECT COUNT(*) FROM guardian) AS totalGuardians,
        (SELECT COUNT(*) FROM medications) AS totalMedications `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("טעינת נתוני לוח הבקרה נכשלה");
        }

        res.json({
            totalUsers: result[0].totalUsers,
            totalChildren:result[0].totalChildren,
            totalGuardians: result[0].totalGuardians,
            totalMedications: result[0].totalMedications
        });
    });
};