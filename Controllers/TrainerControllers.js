const Trainer = require("../Model/TrainerModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/* REGISTER */
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

/* LOGIN */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trainer = await Trainer.findOne({ email });

    if (!trainer || trainer.password !== password)
      return res.status(401).json({ message: "Invalid Credentials" });

    const accessToken = jwt.sign(
      { id: trainer._id, role: "trainer" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login Failed" });
  }
};

/* FORGET PASSWORD (without mailer) */
exports.forgetPassword = async (req, res) => {
  try {
    if (!req.body.email)
      return res.status(400).json({ message: "Email is required" });

    const trainer = await Trainer.findOne({ email: req.body.email });
    if (!trainer)
      return res.status(404).json({ message: "Trainer not found" });

    const resetToken = jwt.sign(
      { id: trainer._id },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    // Return token in response instead of sending email
    res.json({ 
      message: "Reset token generated",
      resetToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) return res.status(400).json({ message: "Password is required" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const trainer = await Trainer.findById(decoded.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    trainer.password = password;
    await trainer.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
/* DASHBOARD */
exports.trainerHome = (req, res) => {
  res.json({ message: "Trainer Dashboard" });
};