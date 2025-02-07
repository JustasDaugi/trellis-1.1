import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { authContext } from '@tests/utils/context'
import { fakeBoard, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory, router } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import getProcedure from '../get'
import { connectToDatabase } from '@server/database/mongo'
import type { DB, Log } from '@server/database/mongo/types'
import type { Collection } from 'mongodb'

vi.mock('@server/database/mongo', () => ({
  connectToDatabase: vi.fn(),
}))

const mockedConnectToDatabase = vi.mocked(connectToDatabase, true)

const testRouter = router({
  get: getProcedure,
})
const createCaller = createCallerFactory(testRouter)

describe('get logs', () => {
  let db: any
  let owner: any
  let board: any

  beforeAll(async () => {
    db = await wrapInRollbacks(createTestDatabase())
    ;[owner] = await insertAll(db, 'user', [fakeUser()])
    ;[board] = await insertAll(
      db,
      'board',
      fakeBoard({
        userId: owner.id,
      })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return error if board does not exist', async () => {
    const nonExistentBoardId = 99999
    const { get } = createCaller(authContext({ db }, owner))
    const result = await get({
      boardId: nonExistentBoardId,
    })

    expect(result).toMatchObject({
      success: false,
      error: 'Failed to retrieve logs',
    })
  })

  it('should return success with empty logs if board exists but no logs are found', async () => {
    const toArrayMock = vi.fn().mockResolvedValue([])
    const limitMock = vi.fn(() => ({ toArray: toArrayMock }))
    const findMock = vi.fn(() => ({ limit: limitMock }))

    const fakeLogsCollection = { find: findMock } as unknown as Collection<Log>
    const fakeDb: DB = { logs: fakeLogsCollection }

    mockedConnectToDatabase.mockResolvedValue(fakeDb)

    const { get } = createCaller(authContext({ db }, owner))
    const result = await get({
      boardId: board.id,
    })

    expect(findMock).toHaveBeenCalledWith({ boardId: board.id })
    expect(limitMock).toHaveBeenCalledWith(100)
    expect(result).toMatchObject({
      success: true,
      logs: [],
    })
  })

  it('should return success with logs if board exists and logs are present', async () => {
    const fakeLogs: Log[] = [
      {
        id: 'log1',
        boardId: board.id,
        cardId: null,
        listId: 1,
        userId: owner.id,
        action: 'created',
        entityType: 'card',
        localTitle: null,
        description: 'Test Log 1',
        timestamp: new Date(),
        userFirstName: 'Test',
        boardTitle: 'Test Board',
        listTitle: 'Test List',
      },
      {
        id: 'log2',
        boardId: board.id,
        cardId: null,
        listId: 1,
        userId: owner.id,
        action: 'created',
        entityType: 'card',
        localTitle: null,
        description: 'Test Log 2',
        timestamp: new Date(),
        userFirstName: 'Test',
        boardTitle: 'Test Board',
        listTitle: 'Test List',
      },
    ]

    const toArrayMock = vi.fn().mockResolvedValue(fakeLogs)
    const limitMock = vi.fn(() => ({ toArray: toArrayMock }))
    const findMock = vi.fn(() => ({ limit: limitMock }))

    const fakeLogsCollection = { find: findMock } as unknown as Collection<Log>
    const fakeDb: DB = { logs: fakeLogsCollection }

    mockedConnectToDatabase.mockResolvedValue(fakeDb)

    const { get } = createCaller(authContext({ db }, owner))
    const customLimit = 50
    const result = await get({
      boardId: board.id,
      limit: customLimit,
    })

    expect(findMock).toHaveBeenCalledWith({ boardId: board.id })
    expect(limitMock).toHaveBeenCalledWith(customLimit)
    expect(result).toMatchObject({
      success: true,
      logs: fakeLogs,
    })
  })

  it('should return error if an exception occurs during logs fetching', async () => {
    mockedConnectToDatabase.mockRejectedValue(new Error('Mongo error'))

    const { get } = createCaller(authContext({ db }, owner))
    const result = await get({
      boardId: board.id,
    })

    expect(result).toMatchObject({
      success: false,
      error: 'Failed to retrieve logs',
    })
  })
})
