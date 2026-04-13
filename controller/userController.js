const db = require('../dbConfig');

//יצירת שם פרופיל
function createProfile(req,res){
    const {name, last, email, pass }= req.body;

    if(!name || !last || email || pass){
        return res.status(400).send("Missing requires fields");
    }

    const sql = `INSERT INTO users (firstname, lastname, password, email)
    VALUES ('${name}', '${last}','${pass}' ,'${email}')`;

    bd.query(sql, (err, result)=>{
        if(err){
            console.log(err);
            return res.status(500).send("DB error");
        }

        console.log("New user created");
        res.send("User created successfully");
    })
}

module.exports = {
    createUser
};