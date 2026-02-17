const express = require("express");
const router = express.Router();
const upload = require("../config/Multer")
const {
  registerStudent,
  login,
  refreshToken,
  forgetPassword,
  resetPassword,
  studentHome,
} = require("../Controllers/StudentControllers");

// Student routes
router.post("/register", registerStudent); 
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forget-password", forgetPassword); 
router.post("/reset-password/:token", resetPassword);
router.get("/dashboard", studentHome);

module.exports = router;


// Upload Route
router.post(
  "/upload-photo",
  upload.single("uploadphoto"),
  (req, res) => {
    console.log(req.file);
    res.json({
      message: "Photo uploaded successfully",
    });
  }
);

module.exports = router;
