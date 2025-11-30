const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
  //Create an email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `My app ${process.env.EMAIL_USER}`,
    to: options.email,
    subject: options.subject,
    html: options.html
  }

  //Send the mail
  await transporter.sendMail(mailOptions);
}

module.exports = {sendEmail};