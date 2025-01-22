import { authContext, requestContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import boardRouter from '..'

const createCaller = createCallerFactory(boardRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('board create', async () => {
  const [user] = await insertAll(db, 'user', [
    fakeUser(),
  ])

  it('should throw an error if user is not authenticated', async () => {
    // ARRANGE
    const { create } = createCaller(requestContext({ db }))

    // ACT & ASSERT
    await expect(
      create({
        title: 'My Special Board',
      })
    ).rejects.toThrow(/unauthenticated/i)
  })

  it('should create a board', async () => {
    // ARRANGE
    const { create } = createCaller(authContext({ db }, user))

    // ACT
    const boardReturned = await create({
      title: 'My Board',
    })

    // ASSERT
    expect(boardReturned).toMatchObject({
      id: expect.any(Number),
      title: 'My Board',
      userId: user.id,
    })

    const [boardCreated] = await selectAll(db, 'board', (eb) =>
      eb('id', '=', boardReturned.id)
    )

    expect(boardCreated).toMatchObject(boardReturned)
  })
})
