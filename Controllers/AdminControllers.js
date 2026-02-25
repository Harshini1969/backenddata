const Admin = require("../Model/AdminModel");
const Student = require("../Model/StudentModel");
const Trainer = require("../Model/TrainerModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/Mailer");

const JWT_SECRET = process.env.JWT_SECRET;

/* ADMIN REGISTER */
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "student") {
      await Student.create({ name, email, password, role: "student" });
    } else if (role === "trainer") {
      await Trainer.create({ name, email, password, role: "trainer" });
    } else {
      return res.status(400).send("Invalid Role");
    }

    res.send("User Registered Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Registration failed");
  }
};

/* ADMIN LOGIN */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: admin._id },
      JWT_SECRET,
      { expiresIn: "10d" }
    );

    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.json({
      message: "Login Successful",
      accessToken,
      user: { name: admin.name, role: "admin" }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login Failed" });
  }
};

/* FORGET PASSWORD */
exports.forgetPassword = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const resetToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1d" });
    const resetLink = `${process.env.FRONTEND_URL}/reset/admin/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Reset Password",
      text: `Click here to reset password: ${resetLink}`
    });

    res.json({ message: "Reset link sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.password = password;
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

/* REFRESH TOKEN */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const admin = await Admin.findOne({ refreshToken: token });
    if (!admin) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET);

    const newAccessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.sendStatus(403);
  }
};

/* DASHBOARD */
exports.getDashboardData = async (req, res) => {
  const students = await Student.find().select("-password");
  const trainers = await Trainer.find().select("-password");
  res.json({ students, trainers });
};

exports.deleteStudent = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
};

exports.deleteTrainer = async (req, res) => {
  await Trainer.findByIdAndDelete(req.params.id);
  res.json({ message: "Trainer deleted" });
};

exports.updateStudent = async (req, res) => {
  const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

exports.updateTrainer = async (req, res) => {
  const updated = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};