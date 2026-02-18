const express = require("express");
const router = express.Router();
const upload = require("../config/Multer");
const { verifyToken } = require("../Middleware/Auth");

router.post(
  "/photo-upload",
  verifyToken, 
  (req, res, next) => {
    
    const allowedRoles = ["admin", "student", "trainer"];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  },
  upload.single("uploadphoto"),
  (req, res) => {
    console.log(req.file);
    res.json({
      message: `${req.user.role} photo uploaded successfully`,
      file: req.file,
    });
  }
);

module.exports = router;
