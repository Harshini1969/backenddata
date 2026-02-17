const Trainer = require("../Model/TrainerModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/Mailer");

/* ================= REGISTER ================= */
exports.registerTrainer = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("No Token Provided");

    const decoded = jwt.verify(token, "Harshini@123");
    if (decoded.role !== "admin") return res.status(403).send("Access Denied");

    const data = { ...req.body, role: "trainer" };
    await Trainer.create(data);
    res.send("Trainer Registered Successfully");
  } catch (error) {
    console.error(error);
    res.status(401).send("Invalid Token");
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trainer = await Trainer.findOne({ email });

    if (!trainer || trainer.password !== password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign(
      { id: trainer._id, role: "trainer" },
      "Harshini@123",
      { expiresIn: "1h" } // longer expiry prevents frequent refresh
    );

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send("Login Failed");
  }
};


/* ================= SEND MAIL ================= */
exports.sendMail = async (req, res) => {
  try {
    const { email, subject, text } = req.body;

    await transporter.sendMail({
      from: "nvs061982@gmail.com",
      to: email,
      subject,
      text,
    });

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

/* ================= FORGET PASSWORD ================= */
exports.forgetPassword = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ email: req.body.email });
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    const resetToken = jwt.sign({ id: trainer._id }, "Harshini@123", { expiresIn: "10m" });
    const link = `http://localhost:3000/reset/trainer/${resetToken}`;

    transporter.sendMail({
      from: "nvs061982@gmail.com",
      to: trainer.email,
      subject: "Reset Password",
      text: link,
    });

    res.json({ message: "Reset link sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, "Harshini@123");
    const trainer = await Trainer.findById(decoded.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    trainer.password = req.body.password;
    await trainer.save();

    res.json({ message: "Password updated" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid token" });
  }
};

/* ================= DASHBOARD ================= */
exports.trainerHome = (req, res) => {
  // Dashboard responds quickly; you can add data fetching here if needed
  res.json({ message: "Trainer Dashboard" });
};

