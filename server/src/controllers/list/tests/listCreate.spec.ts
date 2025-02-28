import { createCallerFactory } from '@server/trpc'
import { fakeBoard, fakeList, fakeUser } from '@server/entities/tests/fakes'
import { insertAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import listRouter from '..'

const createCaller = createCallerFactory(listRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user1, user2] = await insertAll(db, 'user', [fakeUser(), fakeUser()])

const [board] = await insertAll(db, 'board', fakeBoard({ userId: user1.id }))

it('throws an error if the board does not exist', async () => {
  // ARRANGE
  const list = fakeList({
    boardId: board.id + 999999,
  })

  // ACT & ASSERT
  const { create } = createCaller(authContext({ db }, user1))
  await expect(
    create({
      boardId: list.boardId,
      title: list.title,
    })
  ).rejects.toThrow(/not found/i)
})

describe('permissions', () => {
  const list = fakeList({
    boardId: board.id,
  })

  it('allows the board owner to create a list', async () => {
    // ARRANGE
    const { create } = createCaller(authContext({ db }, user1))

    // ACT & ASSERT
    await expect(
      create({
        boardId: list.boardId,
        title: list.title,
      })
    ).resolves.toMatchObject({
      boardId: board.id,
      title: list.title,
    })
  })

  it('throws a ForbiddenError if the user is neither owner nor member', async () => {
    // ARRANGE
    const { create } = createCaller(authContext({ db }, user2))

    // ACT & ASSERT
    await expect(
      create({
        boardId: list.boardId,
        title: list.title,
      })
    ).rejects.toThrow(/authorized|forbidden/i)
  })
})
