import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import nodemailer, {
  type Transporter,
  type SentMessageInfo,
  type SendMailOptions,
} from 'nodemailer'
import sendEmail from '../sendEmail'

describe('sendEmail', () => {
  let sendMailMock: Mock<[SendMailOptions], Promise<SentMessageInfo>>

  beforeEach(() => {
    vi.resetAllMocks()

    sendMailMock = vi
      .fn<[SendMailOptions], Promise<SentMessageInfo>>()
      .mockResolvedValue({} as SentMessageInfo)

    const transporterMock = {
      sendMail: sendMailMock,
    } as unknown as Transporter<SentMessageInfo>
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue(transporterMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should send an email successfully', async () => {
    // Arrange
    const toEmail = 'recipient@example.com'
    const boardLink = 'http://example.com/board/123'
    process.env.GMAIL_USER = 'test@gmail.com'
    process.env.GMAIL_PASS = 'testpass'

    // Act
    await sendEmail(toEmail, boardLink)

    // Assert
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'test@gmail.com',
        pass: 'testpass',
      },
    })

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'test@gmail.com',
      to: toEmail,
      subject: 'Shared Board Link',
      text: `You have been invited to view the board. Here's the link: ${boardLink}`,
    })
  })

  it('should handle email sending errors', async () => {
    // Arrange
    const toEmail = 'recipient@example.com'
    const boardLink = 'http://example.com/board/123'
    process.env.GMAIL_USER = 'test@gmail.com'
    process.env.GMAIL_PASS = 'testpass'

    const error = new Error('Email service error')
    sendMailMock.mockRejectedValueOnce(error)

    // Act & Assert
    await expect(sendEmail(toEmail, boardLink)).rejects.toThrow(
      'Email service error'
    )
  })
})
