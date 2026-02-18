const express = require("express");
const router = express.Router();
const {
  login,
  adminRegister,
  refreshToken,
  forgetPassword,
  resetPassword
} = require("../Controllers/AdminControllers");
const { verifyToken, isAdmin } = require("../Middleware/Auth");

router.post("/login", login);
router.post("/register", verifyToken, isAdmin, adminRegister);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
