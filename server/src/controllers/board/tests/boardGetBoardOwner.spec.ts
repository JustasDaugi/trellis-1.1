import {
  fakeBoard,
  fakeBoardMember,
  fakeUser,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import boardRouter from '..'

const createCaller = createCallerFactory(boardRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user1] = await insertAll(db, 'user', [
  fakeUser({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  }),
])

const [board] = await insertAll(db, 'board', [fakeBoard({ userId: user1.id })])

const { getBoardOwner } = createCaller({ db })

it('should throw NotFoundError if the board owner does not exist', async () => {
  // ARRANGE
  const nonExistentBoardId = 99999

  // ACT & ASSERT
  await expect(getBoardOwner(nonExistentBoardId)).rejects.toThrow(
    'Board owner not found'
  )
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
