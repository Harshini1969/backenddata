const express = require("express");
const router = express.Router();
const upload = require("../config/Multer");

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

router.post(
  "/upload-photo",
  verifyToken,      
  isStudent,
  upload.single("uploadphoto"),
  (req, res) => {
    console.log(req.file);
    res.json({
      message: "Photo uploaded successfully",
      file: req.file, 
    });
  }
);

module.exports = router;
