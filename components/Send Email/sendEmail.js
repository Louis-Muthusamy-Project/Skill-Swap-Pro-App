const nodemailer = require("nodemailer");

async function sendEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
