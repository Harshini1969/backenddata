const Trainer = require("../Model/TrainerModel");
const Student = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/*  REGISTER  */
exports.registerTrainer = async (req, res) => {
  try {
    const data = { ...req.body, role: "trainer" };
    await Trainer.create(data);
    res.send("Trainer Registered Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Registration failed");
  }
};

/*  LOGIN  */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trainer = await Trainer.findOne({ email });
    if (!trainer || trainer.password !== password)
      return res.status(401).json({ message: "Invalid Credentials" });

    const accessToken = jwt.sign({ id: trainer._id, role: "trainer" }, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: trainer._id }, JWT_SECRET, { expiresIn: "10d" });

    trainer.refreshToken = refreshToken;
    await trainer.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send("Login Failed");
  }
};

/*  REFRESH TOKEN  */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const trainer = await Trainer.findOne({ refreshToken: token });
    if (!trainer) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET);
    const newAccessToken = jwt.sign({ id: trainer._id, role: "trainer" }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.sendStatus(403);
  }
};

/*  FORGET PASSWORD */
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const trainer = await Trainer.findOne({ email });
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    const resetToken = jwt.sign({ id: trainer._id }, JWT_SECRET, { expiresIn: "10m" });
    res.json({ message: "Reset token generated successfully", resetToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/*  RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const trainer = await Trainer.findById(decoded.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    trainer.password = newPassword;
    await trainer.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

/* DASHBOARD */
exports.trainerHome = async (req, res) => {
  try {
    const students = await Student.find().select("-password -refreshToken");
    res.json({
      message: "Trainer Dashboard",
      totalStudents: students.length,
      students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};