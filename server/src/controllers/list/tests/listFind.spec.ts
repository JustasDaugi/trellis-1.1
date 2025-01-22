import { authRepoContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import type { ListRepository } from '@server/repositories/listRepository'
import { fakeList } from '@server/entities/tests/fakes'
import listRouter from '..'

const repos = {
  listRepository: {
    findByBoardId: async (boardId: number) => [
      fakeList({
        id: 1,
        boardId,
        title: 'Test List',
      }),
    ],
  } satisfies Partial<ListRepository>,
}

const createCaller = createCallerFactory(listRouter)
const { find } = createCaller(authRepoContext(repos))

it('should return a list of lists for a given board', async () => {
  // ARRANGE (Given)
  const boardId = 5

  // ACT (When)
  const listsFound = await find({ boardId })

  // ASSERT (Then)
  expect(listsFound).toMatchObject([
    {
      id: 1,
      boardId,
      title: 'Test List',
    },
  ])
})
