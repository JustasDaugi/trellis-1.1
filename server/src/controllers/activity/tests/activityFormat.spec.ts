import { authRepoContext } from '@tests/utils/context'
import { createCallerFactory, router } from '@server/trpc'
import formatProcedure from '../format'
import NotFoundError from '@server/utils/errors/NotFound'
import {
  fakeBoard,
  fakeList,
  fakeUser,
  fakeCard,
} from '@server/entities/tests/fakes'

const formatRouter = router({ format: formatProcedure })
const createCaller = createCallerFactory(formatRouter)

describe('format procedure', () => {
  const boardId = 10,
    listId = 20,
    userId = 30,
    cardId = 40
  const board = fakeBoard({ id: boardId, title: 'Test Board' })
  const list = fakeList({ id: listId, boardId, title: 'Test List' })
  const user = fakeUser({ id: userId, firstName: 'John' })
  const card = fakeCard({ id: cardId, listId, title: 'Test Card' })

  const baseRepos = {
    boardRepository: {
      findById: async (id: number) => (id === boardId ? board : null),
    },
    listRepository: {
      findByBoardId: async (id: number) => (id === boardId ? [list] : []),
    },
    userRepository: {
      findById: async (id: number) => (id === userId ? user : null),
    },
    cardRepository: {
      findByListId: async (id: number) => (id === listId ? [card] : []),
    },
  }

  it('should return formatted data when all entities are found and cardId is provided', async () => {
    const { format } = createCaller(authRepoContext(baseRepos))
    const input = { boardId, listId, userId, cardId }
    const result = await format(input)
    expect(result).toMatchObject({
      board: { title: 'Test Board' },
      list: { title: 'Test List' },
      user: { firstName: 'John' },
      card: { title: 'Test Card' },
    })
  })

  it('should return formatted data with null card when cardId is not provided', async () => {
    const { format } = createCaller(authRepoContext(baseRepos))
    const input = { boardId, listId, userId, cardId: undefined }
    const result = await format(input)
    expect(result).toMatchObject({
      board: { title: 'Test Board' },
      list: { title: 'Test List' },
      user: { firstName: 'John' },
      card: null,
    })
  })

  it('should throw NotFoundError when board is not found', async () => {
    const repos = {
      ...baseRepos,
      boardRepository: { findById: async () => null },
    }
    const { format } = createCaller(authRepoContext(repos))
    const input = { boardId, listId, userId, cardId }
    await expect(format(input)).rejects.toThrowError(
      new NotFoundError(`Board with ID ${boardId} not found.`)
    )
  })

  it('should throw NotFoundError when list is not found', async () => {
    const repos = {
      ...baseRepos,
      listRepository: { findByBoardId: async () => [] },
    }
    const { format } = createCaller(authRepoContext(repos))
    const input = { boardId, listId, userId, cardId }
    await expect(format(input)).rejects.toThrowError(
      new NotFoundError(
        `No list found for List ID ${listId} in Board ID ${boardId}.`
      )
    )
  })

  it('should throw NotFoundError when user is not found', async () => {
    const repos = {
      ...baseRepos,
      userRepository: { findById: async () => null },
    }
    const { format } = createCaller(authRepoContext(repos))
    const input = { boardId, listId, userId, cardId }
    await expect(format(input)).rejects.toThrowError(
      new NotFoundError(`User with ID ${userId} not found.`)
    )
  })

  it('should throw NotFoundError when card is not found and cardId is provided', async () => {
    const repos = {
      ...baseRepos,
      cardRepository: { findByListId: async () => [] },
    }
    const { format } = createCaller(authRepoContext(repos))
    const input = { boardId, listId, userId, cardId }
    await expect(format(input)).rejects.toThrowError(
      new NotFoundError(
        `No card found for Card ID ${cardId} in List ID ${listId}.`
      )
    )
  })
})
