import { createTransport } from "nodemailer"

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEventInvitation(
  email: string,
  name: string,
  eventName: string,
  eventDate: string,
  eventLocation: string,
  qrCode: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `You're Invited to ${eventName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hello ${name}!</h1>
        <p>You have been invited to ${eventName}.</p>
        <p>Event Details:</p>
        <ul>
          <li>Date: ${eventDate}</li>
          <li>Location: ${eventLocation}</li>
        </ul>
        <p>Please use the QR code below to check in at the event:</p>
        <img src="${qrCode}" alt="QR Code" style="max-width: 200px;" />
        <p>We look forward to seeing you!</p>
      </div>
    `,
  })
}

export async function sendEventReminder(
  email: string,
  name: string,
  eventName: string,
  eventDate: string,
  eventLocation: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Reminder: ${eventName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hello ${name}!</h1>
        <p>This is a friendly reminder about the upcoming event: ${eventName}</p>
        <p>Event Details:</p>
        <ul>
          <li>Date: ${eventDate}</li>
          <li>Location: ${eventLocation}</li>
        </ul>
        <p>Don't forget to bring your QR code for check-in!</p>
        <p>We look forward to seeing you!</p>
      </div>
    `,
  })
}

export async function sendParticipantInvitation(
  email: string,
  name: string,
  raffleName: string,
  eventDate: string,
  qrCode: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `You're Invited to ${raffleName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hello ${name}!</h1>
        <p>You have been selected to participate in the ${raffleName} raffle!</p>
        <p>Event Details:</p>
        <ul>
          <li>Date: ${eventDate}</li>
        </ul>
        <p>Please use the QR code below to check in at the event:</p>
        <img src="${qrCode}" alt="QR Code" style="max-width: 200px;" />
        <p>We look forward to seeing you!</p>
      </div>
    `,
  })
}

export async function sendWinnerNotification(
  email: string,
  name: string,
  raffleName: string,
  prize: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Congratulations! You've Won in ${raffleName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Congratulations ${name}!</h1>
        <p>You have won a prize in the ${raffleName} raffle!</p>
        <p>Your prize: ${prize}</p>
        <p>Please collect your prize from the event organizers.</p>
      </div>
    `,
  })
}

export async function sendReminderEmail(
  email: string,
  name: string,
  raffleName: string,
  eventDate: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Reminder: ${raffleName} Raffle Event`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hello ${name}!</h1>
        <p>This is a friendly reminder about the upcoming ${raffleName} raffle event.</p>
        <p>Event Date: ${eventDate}</p>
        <p>Don't forget to bring your QR code for check-in!</p>
      </div>
    `,
  })
}