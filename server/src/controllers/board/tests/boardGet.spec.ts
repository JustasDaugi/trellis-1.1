import { fakeBoard, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import boardRouter from '..'

const createCaller = createCallerFactory(boardRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user] = await insertAll(db, 'user', fakeUser())

const { get } = createCaller({ db })

it('should throw NotFoundError if the board does not exist', async () => {
  // ARRANGE
  const nonExistentBoardId = 99999

  // ACT & ASSERT
  await expect(get(nonExistentBoardId)).rejects.toThrow('Board not found')
})

it('should return the board with its selectedBackground when it exists', async () => {
  // ARRANGE
  const [board] = await insertAll(db, 'board', [
    fakeBoard({ userId: user.id, selectedBackground: 'background-1' }),
  ])

  // ACT
  const result = await get(board.id)

  // ASSERT
  expect(result).toMatchObject({
    id: board.id,
    title: board.title,
    selectedBackground: 'background-1',
  })
})

it('should return the board with null selectedBackground if none is set', async () => {
  // ARRANGE
  const [board] = await insertAll(db, 'board', [
    fakeBoard({ userId: user.id, selectedBackground: null }),
  ])

  // ACT
  const result = await get(board.id)

  // ASSERT
  expect(result).toMatchObject({
    id: board.id,
    title: board.title,
    selectedBackground: null,
  })
})
