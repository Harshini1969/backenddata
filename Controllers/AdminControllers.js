const Admin = require("../Model/AdminModel");
const Trainer = require("../Model/TrainerModel");
const Student = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user =
      (await Admin.findOne({ email })) ||
      (await Trainer.findOne({ email })) ||
      (await Student.findOne({ email }));

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      "Harshini@123",
      { expiresIn: "5m" }
    );

    res.status(200).json({
      message: "Login Successful",
      accessToken,
      user: { name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Login Failed" });
  }
};

/* ================= ADMIN REGISTER ================= */
exports.adminRegister = async (req, res) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).send("No Token Provided");

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "Harshini@123");

    if (decoded.role !== "admin")
      return res.status(403).send("Access Denied");

    const { name, email, password, role } = req.body;

    if (role === "student")
      await Student.create({ name, email, password, role: "student" });
    else if (role === "trainer")
      await Trainer.create({ name, email, password, role: "trainer" });
    else
      return res.status(400).send("Invalid Role");

    res.send("User Registered Successfully");
  } catch {
    res.status(401).send("Invalid or Expired Token");
  }
};
