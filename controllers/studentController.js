const db = require("../config/db");

exports.getAllStudents = (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getStudentById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM students WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
};