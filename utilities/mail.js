import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const registerUserMailTemplate = `<div>
    <h1>Dear {{username}}</h1>
    <p>A new account has been created for you!</p>
    <h2>Thank You!</h2>
    </div>`;

export const resetPasswordMailTemplate = `
    <div>
      <h1>Dear {{username}}</h1>
      <p>You have requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href={{resetLink}}">Reset Password</a>
      <p>Or copy this token: {{token}} for manual reset</p>
      <pre>{{token}}</pre>
      <p>This link will expire in 15 minutes for security reasons.</p>
      <h2>Thank You!</h2>
    </div>
  `;

