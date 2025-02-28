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
import { authContext } from '@tests/utils/context'

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
  })
)

it('throws an error if the card does not exist', async () => {
  // ARRANGE
  const nonExistentCardId = card.id + 999999
  const dueDate = new Date()

  const { addDueDate } = createCaller(authContext({ db }, user))

  // ACT & ASSERT
  await expect(
    addDueDate({
      id: nonExistentCardId,
      dueDate,
    })
  ).rejects.toThrow(/not found/i)
})

describe('permissions', () => {
  it('allows a user to add a due date to a card', async () => {
    // ARRANGE
    const { addDueDate } = createCaller(authContext({ db }, user))
    const dueDate = new Date()

    // ACT & ASSERT
    await expect(
      addDueDate({
        id: card.id,
        dueDate,
      })
    ).resolves.toMatchObject({
      id: card.id,
      dueDate,
    })
  })
})
