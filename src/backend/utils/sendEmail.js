let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch {
  // nodemailer will be loaded on demand if installed
}

const sendEmail = async (options) => {
  if (!nodemailer) {
    try {
      nodemailer = require("nodemailer");
    } catch {
      console.warn("nodemailer not installed. Skipping email to:", options.email);
      return;
    }
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === "465" || process.env.SMTP_PORT === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
