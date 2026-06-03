const db = require('../dbConfig');

exports.runQuery = (req, res) => {

    if (req.role !== 'admin') {
        return res.status(403).send("Access denied");
    }

    const { sqlQuery } = req.body;

    if (!sqlQuery) {
        return res.status(400).send("Missing SQL query");
    }

    const cleanQuery = sqlQuery.trim();

    if (!/^select\s+/i.test(cleanQuery)) {
        return res.status(403).send("Only SELECT queries are allowed");
    }

    db.query(cleanQuery, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("SQL query failed");
        }
        
        const safeResult = result.map(row => {
            const { password, ...rowWithoutPassword } = row;
            return rowWithoutPassword;
        });

        res.json(safeResult);
    });
};