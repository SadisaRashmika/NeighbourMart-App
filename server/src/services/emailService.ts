import nodemailer from 'nodemailer';
import { environment } from '../config/environment.js';

const transporter = environment.mailUser && environment.mailPassword
  ? nodemailer.createTransport({
  service: 'gmail',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: { user: environment.mailUser, pass: environment.mailPassword.replace(/\s/g, '') },
    })
  : null;

export async function sendVerificationCode(email: string, code: string) {
  if (!transporter) {
    console.warn(`Mail is not configured. Verification code for ${email}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: environment.mailFrom ?? environment.mailUser,
    to: email,
    subject: 'Your NeighbourMart verification code',
    text: `Your NeighbourMart verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your NeighbourMart verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });
}
