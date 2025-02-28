import { createCallerFactory } from '@server/trpc'
import { authContext, requestContext } from '@tests/utils/context'
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

// Create two users: one we treat as 'owner' and possibly another for negative tests
const [owner, otherUser] = await insertAll(db, 'user', [fakeUser(), fakeUser()])

const [board] = await insertAll(
  db,
  'board',
  fakeBoard({
    userId: owner.id,
  })
)

const [list] = await insertAll(
  db,
  'list',
  fakeList({
    boardId: board.id,
    userId: owner.id,
  })
)

it('throws an error if the list does not exist', async () => {
  // ARRANGE
  const card = fakeCard({
    listId: list.id + 999999, // non-existent list
    title: 'Invalid Card',
    description: 'Card for non-existent list',
  })

  // Simulate an authenticated user who is the owner
  const { create } = createCaller(authContext({ db }, owner))

  // ACT & ASSERT
  await expect(
    create({
      listId: card.listId,
      title: card.title,
      description: card.description,
    })
  ).rejects.toThrow(/not found/i)
})

describe('permissions', () => {
  const card = fakeCard({
    listId: list.id,
    title: 'New card',
    description: 'Description for new card',
  })

  it('throws an error if user is not authenticated', async () => {
    // ARRANGE: no auth context (unauthenticated user)
    const { create } = createCaller(requestContext({ db }))

    // ACT & ASSERT
    await expect(
      create({
        listId: card.listId,
        title: card.title,
        description: card.description,
      })
    ).rejects.toThrow(/unauthenticated|unauthorized/i)
  })

  it('throws an error if user is not owner or member of the board', async () => {
    // ARRANGE: an authenticated user who is not the board owner/member
    const { create } = createCaller(authContext({ db }, otherUser))

    // ACT & ASSERT
    await expect(
      create({
        listId: card.listId,
        title: card.title,
        description: card.description,
      })
    ).rejects.toThrow(/authorized|forbidden/i)
  })

  it('allows the owner to create a card', async () => {
    // ARRANGE: the owner
    const { create } = createCaller(authContext({ db }, owner))

    // ACT
    const createdCard = await create({
      listId: card.listId,
      title: card.title,
      description: card.description,
    })

    // ASSERT
    expect(createdCard).toMatchObject({
      listId: list.id,
      title: card.title,
      description: card.description,
    })
  })
})
