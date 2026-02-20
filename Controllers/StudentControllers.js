const Student = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/*  REGISTER  */
exports.registerStudent = async (req, res) => {
  try {
    const studentData = { ...req.body, role: "student" };
    await Student.create(studentData);
    res.send("Student Registered Successfully");
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).send("Registration failed");
  }
};

/*  LOGIN  */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (!student || student.password !== password)
      return res.status(401).send("Invalid Credentials");

    const accessToken = jwt.sign({ id: student._id, role: "student" }, JWT_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: "10d" });

    student.refreshToken = refreshToken;
    await student.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Login Failed");
  }
};

/*  REFRESH TOKEN  */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const student = await Student.findOne({ refreshToken: token });
    if (!student) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET);
    const newAccessToken = jwt.sign({ id: student._id, role: "student" }, JWT_SECRET, { expiresIn: "1d" });
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
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const resetToken = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Reset token generated successfully", resetToken });
  } catch (error) {
    console.error("Forget password error:", error);
    res.status(500).json({ message: "Server error" });
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
    const student = await Student.findById(decoded.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.password = newPassword;
    await student.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

/*  DASHBOARD  */
exports.studentHome = async (req, res) => {
  res.json({ message: "Student Dashboard" });
};