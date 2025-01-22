import { createCallerFactory } from '@server/trpc'
import { fakeBoard, fakeList, fakeUser } from '@server/entities/tests/fakes'
import { insertAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import listRouter from '..'

const createCaller = createCallerFactory(listRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user] = await insertAll(db, 'user', fakeUser())

const [board] = await insertAll(
  db,
  'board',
  fakeBoard({
    userId: user.id,
  })
)

it('throws an error if the board does not exist', async () => {
  // ARRANGE
  const list = fakeList({
    boardId: board.id + 999999,
  })

  // ACT & ASSERT
  const { create } = createCaller({ db })
  await expect(
    create({
      boardId: list.boardId,
      title: list.title,
      userId: user.id,
    })
  ).rejects.toThrow(/not found/i)
})

describe('permissions', () => {
  const list = fakeList({
    boardId: board.id,
  })

  it('allows a user to create a list', async () => {
    // ARRANGE
    const { create } = createCaller({ db })

    // ACT & ASSERT
    await expect(
      create({
        boardId: list.boardId,
        title: list.title,
        userId: user.id,
      })
    ).resolves.toMatchObject({
      boardId: board.id,
      title: list.title,
    })
  })
})
