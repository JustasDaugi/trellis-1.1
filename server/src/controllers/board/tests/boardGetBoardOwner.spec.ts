import { createCallerFactory } from '@server/trpc'
import boardRouter from '..'
import { authContext } from '@tests/utils/context'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import { insertAll } from '@tests/utils/records'
import {
  fakeBoard,
  fakeBoardMember,
  fakeUser,
} from '@server/entities/tests/fakes'

const createCaller = createCallerFactory(boardRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user1, user2] = await insertAll(db, 'user', [
  fakeUser({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  }),
  fakeUser({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
  }),
])

const [board] = await insertAll(db, 'board', [fakeBoard({ userId: user1.id })])

const { getBoardOwner } = createCaller(authContext({ db }, user1))

it('should throw NotFoundError if the board owner does not exist', async () => {
  // ARRANGE
  const nonExistentBoardId = 99999

  // ACT & ASSERT
  await expect(getBoardOwner(nonExistentBoardId)).rejects.toThrow(/not found/i)
})

it('should return the board ID and board owner ID when the board owner exists', async () => {
  // ARRANGE
  await insertAll(db, 'boardMembers', [
    fakeBoardMember({
      boardId: board.id,
      userId: user1.id,
      boardOwner: user1.id,
    }),
  ])

  // ACT
  const result = await getBoardOwner(board.id)

  // ASSERT
  expect(result).toMatchObject({
    boardId: board.id,
    boardOwnerId: user1.id,
  })
})

it('should throw ForbiddenError if user is neither owner nor member', async () => {
  const { getBoardOwner: getBoardOwnerForUser2 } = createCaller(
    authContext({ db }, user2)
  )

  // ACT & ASSERT
  await expect(getBoardOwnerForUser2(board.id)).rejects.toThrow(
    /Not authorized/i
  )
})
