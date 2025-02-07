import { it, expect, vi, type Mock, describe } from 'vitest'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { fakeUser } from '@server/entities/tests/fakes'
import { random } from '@tests/utils/random'
import userRouter from '..'
import sendResetEmail from '@server/service/passwordReset'
import jwt from 'jsonwebtoken'
import config from '@server/config'

vi.mock('@server/service/passwordReset', () => {
  return {
    __esModule: true,
    default: vi.fn(),
  }
})

const db = await wrapInRollbacks(createTestDatabase())

const createCaller = createCallerFactory(userRouter)
const { sendResetLink } = createCaller({ db })

describe('sendResetLink', () => {
  it('throws if the email is invalid', async () => {
    await expect(sendResetLink({ email: 'not-an-email' })).rejects.toThrow(
      /email/i
    )
  })

  it('throws NotFoundError if user does not exist', async () => {
    const nonExistentEmail = random.email()

    await expect(sendResetLink({ email: nonExistentEmail })).rejects.toThrow(
      /User not found/i
    )
  })

  it('creates and sends reset link if user exists', async () => {
    const user = fakeUser()
    await db.insertInto('user').values(user).execute()

    const mockSendResetEmail = sendResetEmail as unknown as Mock

    const result = await sendResetLink({ email: user.email })
    expect(result).toEqual({ success: true })
    expect(mockSendResetEmail).toHaveBeenCalledTimes(1)

    const [emailArg, resetLinkArg] = mockSendResetEmail.mock.calls[0]
    expect(emailArg).toBe(user.email.toLowerCase())

    expect(resetLinkArg).toContain('token=')
    expect(resetLinkArg).toContain(`email=${encodeURIComponent(user.email)}`)

    const tokenParam = resetLinkArg.match(/token=([^&]+)/)?.[1]
    expect(tokenParam).toBeTruthy()

    if (tokenParam) {
      const decoded = jwt.verify(tokenParam, config.auth.tokenKey) as {
        email: string
      }
      expect(decoded).toMatchObject({ email: user.email.toLowerCase() })
    }
  })

  it('throws InternalServerError if sending email fails', async () => {
    const user = fakeUser()
    await db.insertInto('user').values(user).execute()

    const mockSendResetEmail = sendResetEmail as unknown as Mock
    mockSendResetEmail.mockRejectedValueOnce(new Error('Mail service error'))

    await expect(sendResetLink({ email: user.email })).rejects.toThrow(
      /Failed to send reset email/i
    )
  })
})
