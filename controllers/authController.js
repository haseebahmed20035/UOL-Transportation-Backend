const db = require('../config/db');

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT 
  u.id AS user_id,
  u.name,
  u.email,
  u.role,
  s.id AS student_id
FROM users u
LEFT JOIN students s
ON u.id = s.user_id
WHERE u.email = ? AND u.password = ?`;

  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message || err,
      });
    }

    if (results.length === 0) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = results[0];

    if (user.role === "admin") {
      const adminQuery = "SELECT * FROM admins WHERE email = ?";

      db.query(adminQuery, [user.email], (err, adminResults) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message || err,
          });
        }

        const admin = adminResults[0];

        return res.json({
          success: true,
          user: {
            user_id: user.user_id,
            name: admin?.name || user.name || user.email,
            email: user.email,
            role: "admin",
          },
        });
      });
    } else {
      return res.json({
  success: true,
  user: {
    user_id: user.user_id,
    student_id: user.student_id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
    }
  });
};
exports.googleLogin = (req, res) => {
  const { email } = req.body;

  const findUser = "SELECT * FROM users WHERE email = ?";

  db.query(findUser, [email], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    // 🟢 IF USER EXISTS
    if (results.length > 0) {
      return res.json({
        success: true,
        user: results[0]
      });
    }

    // 🔥 AUTO REGISTER NEW USER
    const insertUser =
      "INSERT INTO users (email, password, role) VALUES (?, '', 'student')";

    db.query(insertUser, [email], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        user: {
          email,
          role: "student"
        }
      });
    });
  });
};

// ✅ REGISTER ADMIN API
exports.registerAdmin = (req, res) => {
  const { name, email, password } = req.body;

  // STEP 1: Insert into users
  const userQuery = "INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')";

  db.query(userQuery, [email, password], (err, userResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message || err
      });
    }

    // STEP 2: Insert into admins
    const adminQuery =
      "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)";

    db.query(adminQuery, [name, email, password], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message || err
        });
      }

      res.json({
        success: true,
        message: "Admin created successfully",
      });
    });
  });
};