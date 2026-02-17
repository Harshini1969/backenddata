const express = require("express");
const router = express.Router();
const upload = require("../config/Multer");

const {
  registerStudent,
  sendMail,
  forgetPassword,
  resetPassword,
  studentHome,
  
} = require("../Controllers/StudentControllers");

router.post("/register", registerStudent);
router.post("/send-mail", sendMail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/home", studentHome);

/* Upload Route */
router.post(
  "/upload-photo",
  upload.single("photo"),
  (req, res) => {
    res.json({ message: "Photo uploaded successfully" });
  }
);


module.exports = router;
