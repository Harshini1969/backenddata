const Admin = require("../Model/AdminModel");
const Student = require("../Model/StudentModel");
const Trainer = require("../Model/TrainerModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "Harshini@123";

/* ADMIN REGISTER  */
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "student") await Student.create({ name, email, password, role: "student" });
    else if (role === "trainer") await Trainer.create({ name, email, password, role: "trainer" });
    else return res.status(400).send("Invalid Role");

    res.send("User Registered Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Registration failed");
  }
};

/* LOGIN  */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = (await Admin.findOne({ email })) || (await Trainer.findOne({ email })) || (await Student.findOne({ email }));

    if (!user || user.password !== password) return res.status(401).json({ message: "Invalid Credentials" });

    const accessToken = jwt.sign({ id: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "5m" });

    res.status(200).json({ message: "Login Successful", accessToken, user: { name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login Failed" });
  }
};
