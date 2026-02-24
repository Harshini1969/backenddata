const express = require("express");
const router = express.Router();

const {
  login,
  adminRegister,
  refreshToken,
  forgetPassword,
  resetPassword,
  getDashboardData,
  deleteStudent,
  deleteTrainer,
  updateStudent,
  updateTrainer
} = require("../Controllers/AdminControllers");

const { verifyToken, isAdmin } = require("../Middleware/Auth");

router.post("/login", login);
router.post("/register", verifyToken, isAdmin, adminRegister);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

/* DASHBOARD DATA */
router.get("/dashboard", verifyToken, isAdmin, getDashboardData);

/* DELETE */
router.delete("/delete-student/:id", verifyToken, isAdmin, deleteStudent);
router.delete("/delete-trainer/:id", verifyToken, isAdmin, deleteTrainer);

/* UPDATE */
router.put("/update-student/:id", verifyToken, isAdmin, updateStudent);
router.put("/update-trainer/:id", verifyToken, isAdmin, updateTrainer);

module.exports = router;