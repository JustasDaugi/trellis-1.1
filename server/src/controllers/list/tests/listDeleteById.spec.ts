import { createCallerFactory } from '@server/trpc'
import { authContext, requestContext } from '@tests/utils/context'
import { fakeBoard, fakeList, fakeUser } from '@server/entities/tests/fakes'
import { insertAll, selectAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import listRouter from '..'

const createCaller = createCallerFactory(listRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('list deleteById', async () => {
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
        id: list.id,
      })
    ).rejects.toThrow(/unauthenticated|unauthorized/i)
  })

  it('should throw an error if user is not the owner of the list', async () => {
    // ARRANGE
    const { deleteById } = createCaller(authContext({ db }, otherUser))

    // ACT & ASSERT
    await expect(
      deleteById({
        id: list.id,
      })
    ).rejects.toThrow(/not authorized/i)
  })

  it('should successfully delete a list', async () => {
    // ARRANGE
    const { deleteById } = createCaller(authContext({ db }, owner))

    // ACT
    const deletedList = await deleteById({
      id: list.id,
    })

    // ASSERT
    expect(deletedList).toMatchObject({
      id: list.id,
      boardId: board.id,
      userId: owner.id,
    })
    const lists = await selectAll(db, 'list', (eb) => eb('id', '=', list.id))
    expect(lists).toHaveLength(0)
  })
})
