import { authContext, requestContext } from '@tests/utils/context'
import { fakeBoard, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import boardRouter from '..'

const createCaller = createCallerFactory(boardRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('update board', async () => {
  const [owner, otherUser] = await insertAll(db, 'user', [
    fakeUser(),
    fakeUser(),
  ])

  const [board] = await insertAll(
    db,
    'board',
    fakeBoard({
      userId: owner.id,
    })
  )

  it('should throw an error if board does not exist', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, owner))
    const nonExistentBoardId = 99999

    // ACT & ASSERT
    await expect(
      update({
        id: nonExistentBoardId,
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
        id: board.id,
        title: 'Updated Title',
      })
    ).rejects.toThrow(/Unauthenticated/i)
  })

  it('should throw an error if user is not authorized to update board', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, otherUser))

    // ACT & ASSERT
    await expect(
      update({
        id: board.id,
        title: 'Updated Title',
      })
    ).rejects.toThrow(/not authorized/i)
  })

  it('should update a board', async () => {
    // ARRANGE
    const { update } = createCaller(authContext({ db }, owner))
    const newTitle = 'Updated Board Title'

    // ACT
    const result = await update({
      id: board.id,
      title: newTitle,
    })

    // ASSERT
    expect(result).toMatchObject({
      id: board.id,
      title: newTitle,
      userId: owner.id,
    })

    const [updatedBoard] = await selectAll(db, 'board', (eb) =>
      eb('id', '=', board.id)
    )
    expect(updatedBoard.title).toBe(newTitle)
  })
})
