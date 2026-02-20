const Admin = require("../Model/AdminModel");
const Student = require("../Model/StudentModel");
const Trainer = require("../Model/TrainerModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/Mailer");
const JWT_SECRET = process.env.JWT_SECRET;

/* ADMIN REGISTER  */
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "student") 
      await Student.create({ name, email, password, role: "student" });
    else if (role === "trainer") 
      await Trainer.create({ name, email, password, role: "trainer" });
    else 
      return res.status(400).send("Invalid Role");

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
    let user = (await Admin.findOne({ email })) ||
    (await Trainer.findOne({ email })) || 
    (await Student.findOne({ email }));

    if (!user || user.password !== password) 
      return res.status(401).json({ message: "Invalid Credentials" });

    const accessToken = jwt.sign({ id: user._id, name: user.name, role: user.role },
       JWT_SECRET, 
       { expiresIn: "30m" });

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

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const resetToken = jwt.sign({ id: admin._id },
       JWT_SECRET,
        { expiresIn: "1d" });
    const resetLink = `${process.env.FRONTEND_URL}/reset/admin/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Reset Password",
      text: `Click here to reset your password: ${resetLink}`,
    });

    res.json({ message: "Reset link sent successfully" });
  } catch (error) {
    console.error("Forget Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (!req.body.password) return res.status(400).json({ message: "Password is required" });

    admin.password = req.body.password;
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

    const newAccessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.sendStatus(403);
  }
};