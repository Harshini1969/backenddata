const Trainer = require("../Model/TrainerModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/Mailer"); 
const JWT_SECRET = process.env.JWT_SECRET ;

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

    const accessToken = jwt.sign(
      { id: trainer._id, role: "trainer" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send("Login Failed");
  }
};

/*  SEND MAIL  */
exports.sendMail = async (req, res) => {
  try {
    const { email, subject, text } = req.body;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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

/*  FORGET PASSWORD  */
exports.forgetPassword = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ email: req.body.email });
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    const resetToken = jwt.sign(
      { id: trainer._id },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset/trainer/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: trainer.email,
      subject: "Reset Password",
      text: resetLink,
    });

    res.json({ message: "Reset link sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/*  RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    const trainer = await Trainer.findById(decoded.id);

    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    trainer.password = req.body.password;
    await trainer.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid token" });
  }
};

/* DASHBOARD  */
exports.trainerHome = (req, res) => {
  res.json({ message: "Trainer Dashboard" });
};
