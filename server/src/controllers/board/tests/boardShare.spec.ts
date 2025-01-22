import { authContext } from '@tests/utils/context'
import { fakeUser, fakeBoard } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { vi, type MockInstance } from 'vitest'
import * as sendModule from '@server/service/sendEmail';
import boardRouter from '..'


const createCaller = createCallerFactory(boardRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('board share', async () => {
  const [user] = await insertAll(db, 'user', [fakeUser()])
  const [anotherUser] = await insertAll(db, 'user', [fakeUser()])
  const [board] = await insertAll(db, 'board', [fakeBoard({ userId: user.id })])

  let sendEmailSpy: MockInstance

  beforeEach(() => {
    sendEmailSpy = vi.spyOn(sendModule, 'default').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should throw an error if the board is not found', async () => {
    // ARRANGE
    const { share } = createCaller(authContext({ db }, user))

    const nonExistentBoardId = board.id + 1

    // ACT & ASSERT
    await expect(
      share({
        boardId: nonExistentBoardId,
        email: anotherUser.email,
      })
    ).rejects.toThrow(/Board not found/i)
  })

  it('should throw an error if the user is not found', async () => {
    // ARRANGE
    const { share } = createCaller(authContext({ db }, user))
    const nonExistentEmail = 'nonexistent@example.com'

    // ACT & ASSERT
    await expect(
      share({
        boardId: board.id,
        email: nonExistentEmail,
      })
    ).rejects.toThrow(/User not found/i)
  })

  it('should send an email successfully', async () => {
    // ARRANGE
    const { share } = createCaller(authContext({ db }, user))

    // ACT
    const result = await share({
      boardId: board.id,
      email: anotherUser.email,
    })

    // ASSERT
    expect(result).toEqual({ success: true })
    expect(sendEmailSpy).toHaveBeenCalledWith(
      anotherUser.email,
      expect.any(String)
    )
  })

  it('should handle email sending errors', async () => {
    // ARRANGE
    const { share } = createCaller(authContext({ db }, user))

    sendEmailSpy.mockRejectedValueOnce(new Error('Email service error'))

    // ACT & ASSERT
    await expect(
      share({
        boardId: board.id,
        email: anotherUser.email,
      })
    ).rejects.toThrow(/Failed to send email/i)
  })
})
