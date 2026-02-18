const jwt = require("jsonwebtoken");
const Student = require("../Model/StudentModel");
const Trainer = require("../Model/TrainerModel");
const Admin = require("../Model/AdminModel");

const JWT_SECRET = process.env.JWT_SECRET || "Harshini@123";

// Verify Token Middleware
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("No Token Provided");
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token error:", error);
    return res.status(401).send("Invalid Token");
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  next();
};

exports.isStudent = (req, res, next) => {
  if (req.user.role !== "student") return res.status(403).send("Access Denied");
  next();
};

exports.isTrainer = (req, res, next) => {
  if (req.user.role !== "trainer") return res.status(403).send("Access Denied");
  next();
};
