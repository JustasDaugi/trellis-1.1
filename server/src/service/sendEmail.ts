import nodemailer from 'nodemailer';

export default async function sendEmail(toEmail: string, boardLink: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: 'Shared Board Link',
    text: `You have been invited to view the board. Here's the link: ${boardLink}`,
  };

  await transporter.sendMail(mailOptions);
}
