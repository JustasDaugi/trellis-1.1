import { authContext, requestContext } from '@tests/utils/context'
import { fakeBoard, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import boardRouter from '..'

const createCaller = createCallerFactory(boardRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('board deleteById', async () => {
  const [owner, otherUser] = await insertAll(db, 'user', [
    fakeUser(),
    fakeUser(),
  ])
  const [board] = await insertAll(
    db,
    'board',
    fakeBoard({ userId: owner.id })
  )

  it('should throw an error if board does not exist', async () => {
    // ARRANGE
    const { deleteById } = createCaller(authContext({ db }, owner))
    const nonExistentId = 99999

    // ACT & ASSERT
    await expect(
      deleteById({
        id: nonExistentId
      })
    ).rejects.toThrow(/not found/i)
  })

  it('should throw an error if user is not authenticated', async () => {
    // ARRANGE
    const { deleteById } = createCaller(requestContext({ db }))

    // ACT & ASSERT
    await expect(
      deleteById({
        id: board.id
      })
    ).rejects.toThrow(/Unauthenticated/i)
  })

  it('should throw an error if user is not the owner of the board', async () => {
    // ARRANGE
    const { deleteById } = createCaller(authContext({ db }, otherUser))

    // ACT & ASSERT
    await expect(
      deleteById({
        id: board.id
      })
    ).rejects.toThrow(/not authorized/i)
  })

  it('should successfully delete a board', async () => {
    // ARRANGE
    const { deleteById } = createCaller(authContext({ db }, owner))

    // ACT
    const deletedBoard = await deleteById({
      id: board.id
    })

    // ASSERT
    expect(deletedBoard).toMatchObject({
      id: board.id,
      userId: owner.id
    })
    const boards = await selectAll(db, 'board', (eb) => 
      eb('id', '=', board.id)
    )
    expect(boards).toHaveLength(0)
})
})
