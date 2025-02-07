import { createCallerFactory } from '@server/trpc'
import {
  fakeBoard,
  fakeList,
  fakeCard,
  fakeUser,
} from '@server/entities/tests/fakes'
import { insertAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import cardRouter from '..'

const createCaller = createCallerFactory(cardRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user] = await insertAll(db, 'user', fakeUser())

const [board] = await insertAll(
  db,
  'board',
  fakeBoard({
    userId: user.id,
  })
)

const [list] = await insertAll(
  db,
  'list',
  fakeList({
    boardId: board.id,
    userId: user.id,
  })
)

const [card] = await insertAll(
  db,
  'card',
  fakeCard({
    listId: list.id,
    userId: user.id,
    dueDate: new Date(),
  })
)

it('throws an error if the card does not exist', async () => {
  // ARRANGE
  const nonExistentCardId = card.id + 999999

  // ACT & ASSERT
  const { deleteDueDate } = createCaller({ db, authUser: user })
  await expect(
    deleteDueDate({
      id: nonExistentCardId,
    })
  ).rejects.toThrow(/not found/i)
})

it('throws an error if the user is not authorized to delete the due date', async () => {
  // ARRANGE
  const [otherUser] = await insertAll(db, 'user', fakeUser())

  // ACT & ASSERT
  const { deleteDueDate } = createCaller({ db, authUser: otherUser })
  await expect(
    deleteDueDate({
      id: card.id,
    })
  ).rejects.toThrow(/not authorized/i)
})

describe('permissions', () => {
  it('allows a user to delete a due date from a card', async () => {
    // ARRANGE
    const { deleteDueDate } = createCaller({ db, authUser: user })

    // ACT & ASSERT
    await expect(
      deleteDueDate({
        id: card.id,
      })
    ).resolves.toMatchObject({
      id: card.id,
      dueDate: null,
    })
  })
})
