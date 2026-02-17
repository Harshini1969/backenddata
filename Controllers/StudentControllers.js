const Student = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/Mailer");

/* ================= Register ================= */
exports.registerStudent = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "Harshini@123");

    if (decoded.role !== "admin") {
      return res.status(403).send("Access Denied");
    }

    const studentData = {
      ...req.body,
      role: "student",
    };

    await Student.create(studentData);
    res.send("Student Registered Successfully");
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};

/* ================= LOGIN STUDENT ================= */
exports.login = async (req, res) => {
  try {
    const student = await Student.findOne(req.body);

    if (!student) {
      return res.send("Invalid Credentials");
    }

    const accessToken = jwt.sign(
      { id: student._id, role: "student" },
      "Harshini@123",
      { expiresIn: "1m" }
    );

    const refreshToken = jwt.sign(
      { id: student._id },
      "Harshini@123",
      { expiresIn: "10d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    student.refreshToken = refreshToken;
    await student.save();

    res.json({ accessToken });
  } catch (error) {
    res.status(500).send("Login Failed");
  }
};

/* ================= REFRESH TOKEN ================= */
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  const student = await Student.findOne({ refreshToken: token });
  if (!student) return res.sendStatus(403);

  try {
    jwt.verify(token, "Harshini@123");

    const newAccessToken = jwt.sign(
      { id: student._id, role: "student" },
      "Harshini@123",
      { expiresIn: "1m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
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
      text: "Hello from Student Section",
    });

    res.send("Mail sent successfully");
  } catch (error) {
    res.status(500).send("Mail sending failed");
  }
};

exports.forgetPassword = async (req, res) => {
  const student = await Student.findOne({ email: req.body.email });

  if (!student) return res.json({ message: "Student not found" });

  const token = jwt.sign(
    { id: student._id },
    "Harshini@123",
    { expiresIn: "10m" }
  );

  const link = `http://localhost:3000/reset/student/${token}`;

  await transporter.sendMail({
    to: student.email,
    subject: "Reset Password",
    text: link,
  });

  res.json({ message: "Reset link sent" });
};

exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, "Harshini@123");
    const student = await Student.findById(decoded.id);

    student.password = req.body.password;
    await student.save();

    res.json({ message: "Password updated" });
  } catch {
    res.status(400).json({ message: "Invalid token" });
  }
};

/* ================= Upload Photo ================= */
exports.uploadPhoto = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      message: "Photo uploaded successfully",
      imageUrl: `http://localhost:5000/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.studentHome = (req, res) => {
  res.send("Student Dashboard");
};
