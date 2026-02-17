const Admin = require("../Model/AdminModel");
const Trainer = require("../Model/TrainerModel");
const Student = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");

/* LOGIN – ANYONE */
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

    const token = jwt.sign(
      { name: user.name, role: user.role },
      "Harshini@123"
    );

    res.send(token);

  } catch (error) {
    res.status(500).send("Login Failed");
  }
};

