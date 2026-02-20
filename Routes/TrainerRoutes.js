const express = require("express");
const router = express.Router();
const trainerController = require("../Controllers/TrainerControllers");
const { verifyToken, isAdmin, isTrainer } = require("../Middleware/Auth");

router.post("/register", verifyToken, isAdmin, trainerController.registerTrainer);
router.post("/login", trainerController.login);
router.post("/refresh-token", trainerController.refreshToken);
router.get("/home", verifyToken, isTrainer, trainerController.trainerHome);
router.post("/forget-password", trainerController.forgetPassword);
router.post("/reset-password/:token", trainerController.resetPassword);

module.exports = router;