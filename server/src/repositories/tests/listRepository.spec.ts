import { createTestDatabase } from '@tests/utils/database'
import { fakeBoard, fakeList, fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import { pick } from 'lodash-es'
import { listKeysPublic } from '@server/entities/list'
import { listRepository } from '../listRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = listRepository(db)

const [user] = await insertAll(db, 'user', [fakeUser()])
const [boardOne, boardTwo] = await insertAll(db, 'board', [
  fakeBoard({ userId: user.id }),
  fakeBoard({ userId: user.id }),
])

const fakeListDefault = (list: Parameters<typeof fakeList>[0] = {}) =>
  fakeList({
    boardId: boardOne.id,
    userId: user.id,
    ...list,
  })

describe('create', () => {
  it('should create a new list', async () => {
    // ARRANGE
    const list = fakeListDefault()

    // ACT
    const createdList = await repository.create(list)

    // ASSERT
    expect(createdList).toEqual({
      ...pick(list, listKeysPublic),
      id: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })
})

describe('findByBoardId', () => {
  it('should find lists by board id', async () => {
    // ARRANGE
    const lists = await insertAll(db, 'list', [
      fakeListDefault({ boardId: boardOne.id }),
      fakeListDefault({ boardId: boardTwo.id }),
      fakeListDefault({ boardId: boardOne.id }),
    ])

    // ACT
    const listsFound = await repository.findByBoardId(boardOne.id)

    // ASSERT
    const expectedLists = [
      pick(lists[0], listKeysPublic),
      pick(lists[2], listKeysPublic),
    ]

    const sortById = (a: any, b: any) => a.id - b.id
    const sortedExpected = expectedLists.sort(sortById)
    const sortedFound = listsFound.sort(sortById)

    expect(sortedFound).toEqual(sortedExpected)
  })

  it('should return an empty array if no lists are found', async () => {
    // ACT
    const listsFound = await repository.findByBoardId(99999)

    // ASSERT
    expect(listsFound).toEqual([])
  })
})

describe('update', () => {
  it('should update a list', async () => {
    // ARRANGE
    const [list] = await insertAll(db, 'list', [fakeListDefault()])
    const updateData = { title: 'Updated Title' }

    // ACT
    const updatedList = await repository.update(list.id, updateData)

    // ASSERT
    expect(updatedList).toEqual({
      ...pick(list, listKeysPublic),
      ...updateData,
    })
  })

  it('should throw an error when updating non-existent list', async () => {
    // ACT & ASSERT
    await expect(
      repository.update(99999, { title: 'New Title' })
    ).rejects.toThrow()
  })
})

describe('delete', () => {
  it('should delete a list', async () => {
    // ARRANGE
    const [list] = await insertAll(db, 'list', [fakeListDefault()])

    // ACT
    await repository.delete(list.id)

    // ASSERT
    const lists = await selectAll(db, 'list', (eb) => eb('id', '=', list.id))
    expect(lists).toHaveLength(0)
  })
})

describe('findUserId', () => {
  it('should find user id for a list', async () => {
    // ARRANGE
    const [list] = await insertAll(db, 'list', [fakeListDefault()])

    // ACT
    const userId = await repository.findUserId(list.id)

    // ASSERT
    expect(userId).toBe(user.id)
  })

  it('should return undefined for non-existent list', async () => {
    // ACT
    const userId = await repository.findUserId(99999)

    // ASSERT
    expect(userId).toBeUndefined()
  })
})
