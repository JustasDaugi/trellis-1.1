import { fakeListTemplate } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import listRouter from '..'

const createCaller = createCallerFactory(listRouter)
const db = await wrapInRollbacks(createTestDatabase())

await clearTables(db, ['listTemplate'])

const { getLists } = createCaller({ db })

it('should return an empty array if no lists exist for the given boardId', async () => {
  // ARRANGE
  const boardId = 1

  // ACT
  const result = await getLists({ boardId })

  // ASSERT
  expect(result).toEqual([])
})

it('should return lists with their correct properties for the given boardId', async () => {
  // ARRANGE
  const boardId = 1
  const [list1, list2] = await insertAll(db, 'listTemplate', [
    fakeListTemplate({ boardId, title: 'List 1', order: 1 }),
    fakeListTemplate({ boardId, title: 'List 2', order: 2 }),
  ])

  // ACT
  const result = await getLists({ boardId })

  // ASSERT
  expect(result).toHaveLength(2)
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: list1.id,
        title: 'List 1',
        order: 1,
      }),
      expect.objectContaining({
        id: list2.id,
        title: 'List 2',
        order: 2,
      }),
    ])
  )
})
