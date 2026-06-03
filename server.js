const express = require('express');
const path = require('path');
const cookieParser  = require('cookie-parser');
const db = require('./dbConfig');

require('./utils/cronJobs');

const userRoutes = require('./router/userRoutes');
const adminRoutes = require('./router/adminRoutes');

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser ());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',userRoutes);
app.use('/',adminRoutes);

//DB Connected
db.connect((err) => {
    if (err) {
        console.error("Database connection faild:", err.message);
    } else {
        console.log("Connction to my SQL database.");
    }
});

//Server
app.listen(port, () => {
    console.log(`Server is listening http://localhost:${port}`);

});