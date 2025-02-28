import { authRepoContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { fakeList } from '@server/entities/tests/fakes'
import listRouter from '..'

const userId = 123

const commonRepos = {
  listRepository: {
    findByBoardId: async (bId: number) => [
      fakeList({
        id: 1,
        boardId: bId,
        title: 'Test List',
      }),
    ],
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
    isMemberOfBoard: async () => true,
  },
}

const createCaller = createCallerFactory(listRouter)

const happyCaller = createCaller(authRepoContext(commonRepos, { id: userId }))
const { find: findHappy } = happyCaller

it('should return a list of lists for a given board', async () => {
  // ARRANGE
  const testBoardId = 5

  // ACT
  const listsFound = await findHappy({ boardId: testBoardId })

  // ASSERT
  expect(listsFound).toMatchObject([
    {
      id: 1,
      boardId: testBoardId,
      title: 'Test List',
    },
  ])
})

it('should throw ForbiddenError if user is neither owner nor member', async () => {
  const notOwnerOrMemberRepos = {
    ...commonRepos,
    boardRepository: {
      findById: async (id: number) => ({
        id,
        userId: 9999,
      }),
    },
    boardMemberRepository: {
      isMemberOfBoard: async () => false,
    },
  }

  const forbiddenCaller = createCaller(
    authRepoContext(notOwnerOrMemberRepos, { id: 111 })
  )
  const { find: findForbidden } = forbiddenCaller

  const testBoardId = 5

  await expect(findForbidden({ boardId: testBoardId })).rejects.toThrow(
    /You are not authorized to view lists for this board/i
  )
})
