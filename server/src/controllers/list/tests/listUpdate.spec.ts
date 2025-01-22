import { authContext, requestContext } from '@tests/utils/context'
import { fakeList, fakeUser, fakeBoard } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import listRouter from '..'

const createCaller = createCallerFactory(listRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('update list', async () => {
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

  it('should throw an error if list does not exist', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, owner))
    const nonExistentListId = 99999

    // ACT & ASSERT
    await expect(
      update({
        id: nonExistentListId,
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
        id: list.id,
        title: 'Updated Title',
      })
    ).rejects.toThrow(/Unauthenticated/i)
  })

  it('should throw an error if user is not authorized to update list', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, otherUser))

    // ACT & ASSERT
    await expect(
      update({
        id: list.id,
        title: 'Updated Title',
      })
    ).rejects.toThrow(/not authorized/i)
  })

  it('should update a list', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, owner))
    const newTitle = 'Updated List Title'

    // ACT
    const result = await update({
      id: list.id,
      title: newTitle,
    })

    // ASSERT
    expect(result).toMatchObject({
      id: list.id,
      title: newTitle,
      boardId: board.id,
      userId: owner.id,
    })

    const [updatedList] = await selectAll(db, 'list', (eb) =>
      eb('id', '=', list.id)
    )
    expect(updatedList.title).toBe(newTitle)
  })
})
