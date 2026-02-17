const Admin = require("../Model/AdminModel");
const Trainer = require("../Model/TrainerModel");
const Student = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");

/* LOGIN TO ANYONE */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user =
      await Admin.findOne({ email, password }) ||
      await Trainer.findOne({ email, password }) ||
      await Student.findOne({ email, password });

    if (!user) {
      return res.send("Invalid Credentials");
    }

    /* ACCESS TOKEN */
    const accessToken = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      "Harshini@123",
      { expiresIn: "1m" }
    );

    /* REFRESH TOKEN */
    const refreshToken = jwt.sign(
      { id: user._id },
      "Harshini@123",
      { expiresIn: "10d" }
    );

    /* STORE REFRESH TOKEN IN COOKIE */
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    /* SAVE REFRESH TOKEN IN DB */
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken });

  } catch (error) {
    res.status(500).send("Login Failed");
  }
};

/* ================= REFRESH TOKEN ================= */
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  let user =
    await Admin.findOne({ refreshToken: token }) ||
    await Trainer.findOne({ refreshToken: token }) ||
    await Student.findOne({ refreshToken: token });

  if (!user) return res.sendStatus(403);

  try {
    jwt.verify(token, "Harshini@123");

    const newAccessToken = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      "Harshini@123",
      { expiresIn: "1m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.sendStatus(403);
  }
};
