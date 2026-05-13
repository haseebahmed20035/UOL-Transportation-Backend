const db = require("../config/db");

exports.makePayment = (req, res) => {
  const { student_id, amount, method } = req.body;

  const sql = `
    INSERT INTO payments (student_id, amount, method, status)
    VALUES (?, ?, ?, 'completed')
  `;

  db.query(sql, [student_id, amount, method], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Payment Successful" });
  });
};

exports.getPayments = (req, res) => {
  db.query("SELECT * FROM payments", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};