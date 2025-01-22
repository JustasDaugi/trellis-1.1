import { createCallerFactory } from '@server/trpc'
import { authContext, requestContext } from '@tests/utils/context'
import {
  fakeBoard,
  fakeCard,
  fakeList,
  fakeUser,
} from '@server/entities/tests/fakes'
import { insertAll, selectAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import listRouter from '..'

const createCaller = createCallerFactory(listRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('card deleteById', async () => {
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
    const { deleteById } = createCaller(authContext({ db }, owner))
    const nonExistentId = 99999

    // ACT & ASSERT
    await expect(
      deleteById({
        id: nonExistentId,
      })
    ).rejects.toThrow(/not found/i)
  })

  it('should throw an error if user is not authenticated', async () => {
    // ARRANGE
    const { deleteById } = createCaller(requestContext({ db }))

    // ACT & ASSERT
    await expect(
      deleteById({
        id: card.id,
      })
    ).rejects.toThrow(/unauthenticated|unauthorized/i)
  })

  it('should throw an error if user is not the owner of the card', async () => {
    // ARRANGE
    const { deleteById } = createCaller(authContext({ db }, otherUser))

    // ACT & ASSERT
    await expect(
      deleteById({
        id: card.id,
      })
    ).rejects.toThrow(/not authorized/i)
  })

  it('should delete a card', async () => {
    // ARRANGE
    const { deleteById } = createCaller(authContext({ db }, owner))

    // ACT
    const deletedCard = await deleteById({
      id: card.id,
    })

    // ASSERT
    expect(deletedCard).toMatchObject({
      id: card.id,
      listId: list.id,
      userId: owner.id,
    })
    const cards = await selectAll(db, 'card', (eb) => eb('id', '=', card.id))
    expect(cards).toHaveLength(0)
  })
})
