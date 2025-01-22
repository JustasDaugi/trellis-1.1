import { authContext, requestContext } from '@tests/utils/context'
import {
  fakeBoard,
  fakeList,
  fakeCard,
  fakeUser,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import cardRouter from '..'

const createCaller = createCallerFactory(cardRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('update card', async () => {
  const [owner, otherUser] = await insertAll(db, 'user', [
    fakeUser(),
    fakeUser(),
  ])

  const [board] = await insertAll(db, 'board', fakeBoard({ userId: owner.id }))

  const [list] = await insertAll(
    db,
    'list',
    fakeList({
      boardId: board.id,
      userId: owner.id,
    })
  )

  const [card] = await insertAll(
    db,
    'card',
    fakeCard({
      listId: list.id,
      userId: owner.id,
    })
  )

  it('should throw an error if card does not exist', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, owner))
    const nonExistentCardId = 99999

    // ACT & ASSERT
    await expect(
      update({
        id: nonExistentCardId,
        title: 'Updated Title',
      })
    ).rejects.toThrow(/not found/i)
  })

  it('should throw an error if user is not authenticated', async () => {
    // ARRANGE
    const { update } = createCaller(requestContext({ db }))

    // ACT & ASSERT
    await expect(
      update({
        id: card.id,
        title: 'Title updated',
      })
    ).rejects.toThrow(/Unauthenticated/i)
  })

  it('should throw an error if user is not authorized to update card', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, otherUser))

    // ACT & ASSERT
    await expect(
      update({
        id: card.id,
        title: 'Updated Title',
      })
    ).rejects.toThrow(/not authorized/i)
  })

  it('should update title of a card', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, owner))
    const newTitle = 'Updated Card Title'

    // ACT
    const result = await update({
      id: card.id,
      title: newTitle,
    })

    // ASSERT
    expect(result).toMatchObject({
      id: card.id,
      listId: list.id,
      userId: owner.id,
    })
  })

  it('should allow to update a cards listId', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, owner))

    // ACT
    const result = await update({
      id: card.id,
      listId: list.id,
    })

    // ASSERT
    expect(result).toMatchObject({
      id: card.id,
      listId: list.id,
      userId: owner.id,
    })
  })
})
