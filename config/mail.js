const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "haseeb.ahmed20035@gmail.com",
    pass: "luva jkse zvvg yeck",
  },
});

module.exports = transporter;