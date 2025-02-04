import { authContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

describe('user findById', async () => {
  const [user, otherUser] = await insertAll(db, 'user', [
    fakeUser(),
    fakeUser(),
  ])

  it('should throw an error if user does not exist', async () => {
    // ARRANGE
    const { findById } = createCaller(authContext({ db }, user))
    const nonExistentId = 99999

    // ACT & ASSERT
    await expect(
      findById({
        id: nonExistentId,
      })
    ).rejects.toThrow(/not found/i)
  })

  it('should allow any user to find another user by id', async () => {
    // ARRANGE
    const { findById } = createCaller(authContext({ db }, otherUser))

    // ACT
    const foundUser = await findById({
      id: user.id,
    })

    // ASSERT
    expect(foundUser).toMatchObject({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  })

  it('should allow a user to find themselves by id', async () => {
    // ARRANGE
    const { findById } = createCaller(authContext({ db }, user))

    // ACT
    const foundUser = await findById({
      id: user.id,
    })

    // ASSERT
    expect(foundUser).toMatchObject({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  })

  it('should allow any authenticated user to find another user by id', async () => {
    // ARRANGE
    const { findById } = createCaller(authContext({ db }, otherUser))

    // ACT
    const foundUser = await findById({
      id: user.id,
    })

    // ASSERT
    expect(foundUser).toMatchObject({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  })

  it('should allow a user to find themselves by id', async () => {
    // ARRANGE
    const { findById } = createCaller(authContext({ db }, user))

    // ACT
    const foundUser = await findById({
      id: user.id,
    })

    // ASSERT
    expect(foundUser).toMatchObject({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  })
})
