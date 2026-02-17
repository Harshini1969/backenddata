const Trainer = require("../Model/TrainerModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/Mailer");

/* ================= REGISTER TRAINER ================= */
exports.registerTrainer = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "Harshini@123");

    if (decoded.role !== "admin") {
      return res.status(403).send("Access Denied");
    }

    const data = req.body;
    data.role = "trainer";

    await Trainer.create(data);
    res.send("Trainer Registered Successfully");
  } catch (err) {
    res.status(401).send("Invalid Token");
  }
};

/* ================= LOGIN TRAINER ================= */
exports.login = async (req, res) => {
  try {
    const trainer = await Trainer.findOne(req.body);

    if (!trainer) {
      return res.send("Invalid Credentials");
    }

    const accessToken = jwt.sign(
      { id: trainer._id, role: "trainer" },
      "Harshini@123",
      { expiresIn: "1m" }
    );

    const refreshToken = jwt.sign(
      { id: trainer._id },
      "Harshini@123",
      { expiresIn: "10d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    trainer.refreshToken = refreshToken;
    await trainer.save();

    res.json({ accessToken });
  } catch (err) {
    res.status(500).send("Login Failed");
  }
};

/* ================= REFRESH TOKEN ================= */
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  const trainer = await Trainer.findOne({ refreshToken: token });
  if (!trainer) return res.sendStatus(403);

  try {
    jwt.verify(token, "Harshini@123");

    const newAccessToken = jwt.sign(
      { id: trainer._id, role: "trainer" },
      "Harshini@123",
      { expiresIn: "1m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.sendStatus(403);
  }
};

/* ================= SEND MAIL ================= */
exports.sendMail = async (req, res) => {
  await transporter.sendMail({
    from: "nvs061982@gmail.com",
    to: req.body.email,
    subject: "Trainer Mail",
    text: "Hello from Trainer Section",
  });

  res.send("Mail sent!");
};

/* ================= FORGET PASSWORD ================= */
exports.forgetPassword = async (req, res) => {
  const trainer = await Trainer.findOne({ email: req.body.email });

  if (!trainer) {
    return res.json({ message: "Trainer doesn't exist!" });
  }

  const resetToken = jwt.sign(
    { id: trainer._id },
    "Harshini@123",
    { expiresIn: "10m" }
  );

  const link = `http://localhost:3000/reset/trainer/${resetToken}`;

  await transporter.sendMail({
    from: "nvs061982@gmail.com",
    to: trainer.email,
    subject: "Reset Password",
    text: `Reset link: ${link}`,
  });

  res.json({ message: "Email sent successfully" });
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, "Harshini@123");
    const trainer = await Trainer.findById(decoded.id);

    trainer.password = req.body.password;
    await trainer.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

exports.trainerHome = (req, res) => {
  res.send("Trainer Dashboard");
};
