const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");

router.get("/", busController.getAllBuses);
router.get("/location/:busId", busController.getBusLocation);

module.exports = router;