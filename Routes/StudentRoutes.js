const express = require("express");
const router = express.Router();
const {
  registerStudent,
  login,
  refreshToken,
  forgetPassword,
  resetPassword,
  studentHome,
} = require("../Controllers/StudentControllers");

const { verifyToken, isAdmin, isStudent } = require("../Middleware/Auth");

router.post("/register", verifyToken, isAdmin, registerStudent);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/dashboard", verifyToken, isStudent, studentHome);

module.exports = router;