const Student = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/Mailer"); 
const JWT_SECRET = process.env.JWT_SECRET ;

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

/* LOGIN  */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (!student || student.password !== password)
      return res.status(401).send("Invalid Credentials");

    const accessToken = jwt.sign(
      { id: student._id, role: "student" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: student._id },
      JWT_SECRET,
      { expiresIn: "10d" }
    );

    student.refreshToken = refreshToken;
    await student.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Login Failed");
  }
};

/* REFRESH TOKEN  */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const student = await Student.findOne({ refreshToken: token });
    if (!student) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET);

    const newAccessToken = jwt.sign(
      { id: student._id, role: "student" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.sendStatus(403);
  }
};

/* FORGET PASSWORD */
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const resetToken = jwt.sign(
      { id: student._id },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset/student/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: "Reset Password",
      text: `Click here to reset your password: ${resetLink}`,
    });

    res.json({ message: "Reset link sent successfully" });
  } catch (error) {
    console.error("Forget password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/*  RESET PASSWORD  */
exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    const student = await Student.findById(decoded.id);

    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!req.body.password)
      return res.status(400).json({ message: "Password is required" });

    student.password = req.body.password;
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
