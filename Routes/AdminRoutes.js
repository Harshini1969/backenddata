const express = require("express");
const router = express.Router();

const {
  login,
  adminRegister,
  refreshToken,
  forgetPassword,
  resetPassword,
  viewAllStudents,
  viewAllTrainers
} = require("../Controllers/AdminControllers");

const { verifyToken, isAdmin } = require("../Middleware/Auth");

router.post("/login", login);
router.post("/register", verifyToken, isAdmin, adminRegister);
router.post("/refresh-token", refreshToken);

router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/students", verifyToken, isAdmin, viewAllStudents);
router.get("/trainers", verifyToken, isAdmin, viewAllTrainers);

module.exports = router;