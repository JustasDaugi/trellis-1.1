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

const { removeBoardMembers } = createCaller({
  db,
  authUser: { id: user1.id },
})

it('should throw NotFoundError if the board member does not exist', async () => {
  // ACT & ASSERT
  await expect(
    removeBoardMembers({ boardId: board.id, userId: 99999 })
  ).rejects.toThrow('Board member not found')
})

it('should throw ForbiddenError if the authenticated user is not the user being removed', async () => {
  // ARRANGE
  await insertAll(db, 'boardMembers', [
    fakeBoardMember({ boardId: board.id, userId: user2.id }),
  ])

  // ACT & ASSERT
  await expect(
    removeBoardMembers({ boardId: board.id, userId: user2.id })
  ).rejects.toThrow('You are not authorized to remove this board member')
})

it('should remove the board member if the authenticated user is the same as the user being removed', async () => {
  // ARRANGE
  await insertAll(db, 'boardMembers', [
    fakeBoardMember({ boardId: board.id, userId: user1.id }),
  ])

  // ACT
  const result = await removeBoardMembers({
    boardId: board.id,
    userId: user1.id,
  })

  // ASSERT
  expect(result).toMatchObject({
    boardId: board.id,
    userId: user1.id,
  })

  const remainingMembers = await db
    .selectFrom('boardMembers')
    .selectAll()
    .where('boardId', '=', board.id)
    .execute()
  expect(remainingMembers).toHaveLength(0)
})
