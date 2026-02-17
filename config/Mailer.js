const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "nvs061982@gmail.com",
        pass: "ynrn lnpg ohhe niqb",
       
    }
});

module.exports = transporter;
