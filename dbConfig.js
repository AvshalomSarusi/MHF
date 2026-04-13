const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log("ENV TEST:", process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME);
const mysql=require('mysql2');


const db=mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = db;