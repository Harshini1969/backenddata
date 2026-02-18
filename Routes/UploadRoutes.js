const express = require("express");
const router = express.Router();
const upload = require("../config/Multer");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Upload route for all roles
router.post(
  "/photo-upload",
  upload.single("uploadphoto"), 
  async (req, res) => {
    try {
     
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

      const token = authHeader.split(" ")[1]; 
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET);

      const userRole = decoded.role;

      // Only allow admin, student, trainer
      const allowedRoles = ["admin", "student", "trainer"];
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      console.log(req.file);

      res.json({
        message: `${userRole} photo uploaded successfully`,
        file: req.file,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }
);

module.exports = router;
