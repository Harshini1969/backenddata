const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  family: 4, // force IPv4 (important for Render)
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
