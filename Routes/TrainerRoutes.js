const express = require("express");
const router = express.Router();
const trainerController = require("../Controllers/TrainerControllers");

router.post("/sendMail", trainerController.sendMail);
router.post("/forget-password", trainerController.forgetPassword);
router.post("/resetPass/:token", trainerController.resetPassword);
router.post("/register", trainerController.registerTrainer);
router.get("/home", trainerController.trainerHome);

module.exports = router;
