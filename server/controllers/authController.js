const db = require('../database');

exports.login = (req, res) => {
    const { username, password, role } = req.body;

    console.log('Login Request:', { username, password, role });

    const query = 'SELECT * FROM users WHERE username = ? AND role = ?';
    db.query(query, [username, role], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];
            console.log('User Found:', user);

            // Compare plaintext passwords
            if (password === user.password) {
                req.session.userId = user.id;
                req.session.role = user.role;
                console.log('Login Successful:', user);
                return res.json({ success: true, user });
            } else {
                console.log('Invalid Password');
                return res.json({ success: false, message: 'Invalid password' });
            }
        } else {
            console.log('User Not Found');
            return res.json({ success: false, message: 'User not found' });
        }
    });
};
// Logout route
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout Error:', err);
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
};