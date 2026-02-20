const Admin = require("../Model/AdminModel");
const Student = require("../Model/StudentModel");
const Trainer = require("../Model/TrainerModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/* ================= ADMIN REGISTER ================= */
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

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = (await Admin.findOne({ email })) ||
               (await Trainer.findOne({ email })) ||
               (await Student.findOne({ email }));

    if (!user || user.password !== password)
      return res.status(401).json({ message: "Invalid Credentials" });

    const accessToken = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "10d" });
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });

    res.status(200).json({
      message: "Login Successful",
      accessToken,
      user: { name: user.name, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login Failed" });
  }
};

/* ================= FORGOT PASSWORD ================= */
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    const resetToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "10m" });
    res.json({ message: "Reset token generated successfully", resetToken });

  } catch (error) {
    console.error("Forget Password Error:", error);
    res.status(500).json({ message: "Failed to generate reset token" });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

/* ================= REFRESH TOKEN ================= */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const admin = await Admin.findOne({ refreshToken: token });
    if (!admin) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET);

    const newAccessToken = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, { expiresIn: "30m" });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.sendStatus(403);
  }
};

/* ================= VIEW ALL STUDENTS ================= */
exports.viewAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password -refreshToken");
    res.json({ totalStudents: students.length, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

/* ================= VIEW ALL TRAINERS ================= */
exports.viewAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().select("-password -refreshToken");
    res.json({ totalTrainers: trainers.length, trainers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch trainers" });
  }
};