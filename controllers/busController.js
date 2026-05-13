const db = require("../config/db");

exports.getAllBuses = (req, res) => {
  db.query("SELECT * FROM buses", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getBusLocation = (req, res) => {
  const { busId } = req.params;

  const sql = `
    SELECT * FROM bus_locations 
    WHERE bus_id = ? 
    ORDER BY recorded_at DESC LIMIT 1
  `;

  db.query(sql, [busId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
};