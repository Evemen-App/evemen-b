import { createTransport } from "nodemailer";

export const mailTransporter = createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'keskot87@gmail.com',
        pass: 'gqmkbgwiqzvsaqww'
    }
})

export const registerUserMailTemplate = `<div>
    <h1>Dear {{username}}</h1>
    <p>A new account has been created for you!</p>
    <h2>Thank You!</h2>
    </div>`;

