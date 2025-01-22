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

it('throws an error if the list does not exist', async () => {
  // ARRANGE
  const card = fakeCard({
    listId: list.id + 999999,
    title: 'Invalid Card',
    description: 'Card for non-existent list',
  })

  // ACT & ASSERT
  const { create } = createCaller({ db })
  await expect(
    create({
      listId: card.listId,
      title: card.title,
      description: card.description,
      userId: 1,
    })
  ).rejects.toThrow(/not found/i)
})

describe('permissions', () => {
  const card = fakeCard({
    listId: list.id,
    title: 'New card',
    description: 'Description for new card',
  })

  it('allows a user to create a card', async () => {
    // ARRANGE
    const { create } = createCaller({ db })
  
    // ACT & ASSERT
    await expect(
      create({
        listId: card.listId,
        title: card.title,
        description: card.description,
        userId: user.id,
      })
    ).resolves.toMatchObject({
      listId: list.id,
      title: card.title,
      description: card.description,
    })
  })
  
})
