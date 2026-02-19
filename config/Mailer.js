const nodemailer = require("nodemailer");
// console.log("Email user:", process.env.EMAIL_USER);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = transporter;
