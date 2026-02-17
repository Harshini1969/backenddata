const Student = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/Mailer");

/* ================= REGISTER ================= */
exports.registerStudent = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) return res.status(401).send("No Token Provided");

    const decoded = jwt.verify(token, "Harshini@123");
    if (decoded.role !== "admin") return res.status(403).send("Access Denied");

    const studentData = { ...req.body, role: "student" };
    await Student.create(studentData);
    res.send("Student Registered Successfully");
  } catch (error) {
    console.error("Register error:", error);
    res.status(401).send("Invalid Token");
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (!student || student.password !== password)
      return res.status(401).send("Invalid Credentials");

    const accessToken = jwt.sign({ id: student._id, role: "student" }, "Harshini@123", { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: student._id }, "Harshini@123", { expiresIn: "10d" });

    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax", secure: false });

    student.refreshToken = refreshToken;
    await student.save();

    res.json({ accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Login Failed");
  }
};

/* ================= REFRESH TOKEN ================= */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const student = await Student.findOne({ refreshToken: token });
    if (!student) return res.sendStatus(403);

    jwt.verify(token, "Harshini@123");

    const newAccessToken = jwt.sign({ id: student._id, role: "student" }, "Harshini@123", { expiresIn: "1h" });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.sendStatus(403);
  }
};

/* ================= SEND MAIL ================= */
exports.sendMail = async (req, res) => {
  try {
    await transporter.sendMail({
      from: "nvs061982@gmail.com",
      to: "harshinin1969@gmail.com",
      subject: "Nodemailer Practice",
      text: "Hello from Student Section"
    });
    res.send("Mail sent!");
  } catch (error) {
    console.error("Send mail error:", error);
    res.status(500).send("Mail sending failed");
  }
};

/* ================= FORGOT PASSWORD ================= */
exports.forgetPassword = async (req, res) => {
  try {
    const student = await Student.findOne({
      email: req.body.email
    });

    if (!student) {
      return res.status(404).json({
        message: "Student doesn't exist!"
      });
    }

    const resetToken = jwt.sign(
      { id: student._id },
      "Harshini@123",
      { expiresIn: "10m" }
    );

    const link = `http://localhost:3000/reset/student/${resetToken}`;

    await transporter.sendMail({
      from: "nvs061982@gmail.com",
      to: student.email,
      subject: "Reset Password",
      text: `Reset link: ${link}`
    });

    res.json({
      message: "Email sent successfully. Check your email."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, "Harshini@123");

    const student = await Student.findById(decoded.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        message: "Password is required"
      });
    }

    student.password = req.body.password;
    await student.save();

    res.json({
      message: "Password updated"
    });

  } catch (error) {
    res.status(400).json({
      message: "Invalid or expired token"
    });
  }
};

/* ================= DASHBOARD ================= */
exports.studentHome = async (req, res) => {
  res.json({ message: "Student Dashboard" });
};
