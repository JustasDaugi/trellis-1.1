import { fakeBoard, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import boardRouter from '..'

const createCaller = createCallerFactory(boardRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user] = await insertAll(db, 'user', fakeUser())

const { findAll } = createCaller({ db })

it('should return an empty list if there are no boards', async () => {
  // ARRANGE & ACT
  const result = await findAll({ userId: user.id })

  // ASSERT
  expect(result).toHaveLength(0)
})

it('should return a list of boards with default pagination', async () => {
  // ARRANGE
  await insertAll(db, 'board', [fakeBoard({ userId: user.id })])

  // ACT
  const boards = await findAll({ userId: user.id })

  // ASSERT
  expect(boards).toHaveLength(1)
})



it('should return the latest board first', async () => {
  // ARRANGE
  const [boardOld] = await insertAll(db, 'board', [
    fakeBoard({ userId: user.id }),
  ])
  const [boardNew] = await insertAll(db, 'board', [
    fakeBoard({ userId: user.id }),
  ])

  // ACT
  const boards = await findAll({ userId: user.id })

  // ASSERT
  expect(boards[0]).toMatchObject(boardNew)
  expect(boards[1]).toMatchObject(boardOld)
})
