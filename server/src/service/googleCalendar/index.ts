import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config()

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

export function getAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: 'online',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  })
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens)
  return tokens
}

export async function createCalendarEvent({
  title,
  description,
  startDateTime,
  endDateTime,
}: {
  title: string
  description?: string
  startDateTime: Date
  endDateTime: Date
}) {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

  const event = {
    summary: title,
    description,
    start: { dateTime: startDateTime.toISOString() },
    end: { dateTime: endDateTime.toISOString() },
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  })

  return response.data
}
