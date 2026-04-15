const db = require("../config/db");

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO students (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, password], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "User Registered Successfully",
      userId: result.insertId
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM students WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      res.json({
        message: "Login Successful",
        user: result[0]
      });
    } else {
      res.status(401).json({ message: "Invalid Credentials" });
    }
  });
};