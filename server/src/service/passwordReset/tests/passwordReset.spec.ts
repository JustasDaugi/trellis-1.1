import { type Mock } from 'vitest'
import nodemailer, {
  type Transporter,
  type SentMessageInfo,
  type SendMailOptions,
} from 'nodemailer'
import sendResetEmail from '..'

describe('sendResetEmail', () => {
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

  it('should send a password reset email successfully', async () => {
    // Arrange
    const toEmail = 'user@example.com'
    const resetLink = 'http://example.com/reset?token=abcdef123456'
    process.env.GMAIL_USER = 'test@gmail.com'
    process.env.RESET_APP_PASS = 'testResetPass'

    // Act
    await sendResetEmail(toEmail, resetLink)

    // Assert
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'test@gmail.com',
        pass: 'testResetPass',
      },
    })

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'test@gmail.com',
      to: toEmail,
      subject: 'Password Reset Request',
      text: `Please use the following link to reset your password: ${resetLink}`,
    })
  })

  it('should handle errors when sending a password reset email', async () => {
    // Arrange
    const toEmail = 'user@example.com'
    const resetLink = 'http://example.com/reset?token=abcdef123456'
    process.env.GMAIL_USER = 'test@gmail.com'
    process.env.RESET_APP_PASS = 'testResetPass'

    const error = new Error('Password reset email service error')
    sendMailMock.mockRejectedValueOnce(error)

    // Act & Assert
    await expect(sendResetEmail(toEmail, resetLink)).rejects.toThrow(
      'Password reset email service error'
    )
  })
})
