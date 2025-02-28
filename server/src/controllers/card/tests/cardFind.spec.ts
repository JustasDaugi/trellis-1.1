import { authRepoContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { fakeCard } from '@server/entities/tests/fakes'
import cardRouter from '..'

const userId = 123
const boardId = 999

const commonRepos = {
  cardRepository: {
    findByListId: async (listId: number) => [
      fakeCard({
        id: 1,
        listId,
        title: 'Test card',
        order: 1,
        dueDate: null,
      }),
    ],
  },
  listRepository: {
    findById: async (listId: number) => {
      return {
        id: listId,
        boardId,
      }
    },
  },
  boardRepository: {
    findById: async (id: number) => {
      return {
        id,
        userId,
      }
    },
  },
  boardMemberRepository: {
    isMemberOfBoard: async () => {
      return true
    },
  },
}

const createCaller = createCallerFactory(cardRouter)
const happyCaller = createCaller(authRepoContext(commonRepos, { id: userId }))
const { find: findHappy } = happyCaller

it('should return a list of cards for a given list', async () => {
  // ARRANGE
  const listId = 5

  // ACT
  const cardsFound = await findHappy({ listId })

  // ASSERT
  expect(cardsFound).toMatchObject([
    {
      listId,
      title: 'Test card',
      order: 1,
    },
  ])
})

it('should throw ForbiddenError if user is neither owner nor member', async () => {
  // ARRANGE:

  const notOwnerOrMemberRepos = {
    ...commonRepos,
    boardRepository: {
      findById: async (id: number) => {
        return {
          id,
          userId: 9999,
        }
      },
    },
    boardMemberRepository: {
      isMemberOfBoard: async () => false,
    },
  }

  const notMemberCaller = createCaller(authRepoContext(notOwnerOrMemberRepos, { id: 111 }))
  const { find: findForbidden } = notMemberCaller

  const listId = 5

  // ACT & ASSERT
  await expect(findForbidden({ listId })).rejects.toThrow(
    /You do not have permission to view cards on this list/
  )
})
