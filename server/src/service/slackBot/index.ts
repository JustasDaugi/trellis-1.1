import { WebClient } from '@slack/web-api'
import { generateDescription, type LogInput } from '@server/controllers/activity/utils'

export class SlackBot {
  private slackClient: WebClient
  private slackChannel: string

  public lastMessage?: string
  public lastError?: string

  constructor(token: string, channel: string) {
    this.slackClient = new WebClient(token)
    this.slackChannel = channel
  }

  public async sendDescription(logInput: LogInput): Promise<void> {
    const description = generateDescription(logInput)

    try {
      const response = await this.slackClient.chat.postMessage({
        channel: this.slackChannel,
        text: description,
      })
      this.lastMessage = `Message sent: ${
        response.ts ? `TS: ${response.ts}` : description
      }`
      this.lastError = undefined
    } catch (err: any) {
      this.lastError = err.message || String(err)
      this.lastMessage = undefined
      throw err
    }
  }
}

const slackToken = process.env.SLACK_BOT_TOKEN || ''
const slackChannel = process.env.SLACK_CHANNEL_ID || '#social'
export const slackBot = new SlackBot(slackToken, slackChannel)
