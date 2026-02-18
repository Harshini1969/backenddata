const express = require("express");
const router = express.Router();
const { login, adminRegister } = require("../Controllers/AdminControllers");
const { verifyToken, isAdmin } = require("../Middleware/Auth");
router.post("/login", login);
router.post("/register", verifyToken, isAdmin, adminRegister);

module.exports = router;
