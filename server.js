const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'quiz_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Routes
const authRoutes = require('./server/routes/auth');
const adminRoutes = require('./server/routes/admin');
const teacherRoutes = require('./server/routes/teacher');
const studentRoutes = require('./server/routes/student');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});