const express = require("express");
const router = express.Router();
const trainerController = require("../Controllers/TrainerControllers");

/* ===== MAIL & PASSWORD ===== */
router.post("/sendMail", trainerController.sendMail);
router.post("/forgetPassword", trainerController.forgetPassword);
router.post("/resetPass/:token", trainerController.resetPassword);

/* ===== ADMIN REGISTER TRAINER ===== */
router.post("/register", trainerController.registerTrainer);

/* ===== TRAINER DASHBOARD ===== */
router.get("/home", trainerController.trainerHome);

module.exports = router;
