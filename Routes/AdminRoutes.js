const express = require("express");
const router = express.Router();
const { login, adminRegister } = require("../Controllers/AdminControllers");

router.post("/login", login);
router.post("/register", adminRegister);

module.exports = router;
