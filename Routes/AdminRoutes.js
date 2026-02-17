const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/AdminControllers");

router.post("/login", adminController.login);

module.exports = router;
