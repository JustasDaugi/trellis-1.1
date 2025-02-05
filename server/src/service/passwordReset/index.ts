import nodemailer from 'nodemailer'

export default async function sendResetEmail(
  toEmail: string,
  resetLink: string
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.RESET_APP_PASS,
    },
  })

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: 'Password Reset Request',
    text: `Please use the following link to reset your password: ${resetLink}`,
  }

  await transporter.sendMail(mailOptions)
}
