import { authRepoContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import type { CardRepository } from '@server/repositories/cardRepository'
import { fakeCard } from '@server/entities/tests/fakes'
import cardRouter from '..'

const repos = {
  cardRepository: {
    findByListId: async (listId: number) => [
      fakeCard({
        id: 1,
        listId,
        title: 'Test card',
        order: 1,
      }),
    ],
  } satisfies Partial<CardRepository>,
}

const createCaller = createCallerFactory(cardRouter)
const { find } = createCaller(authRepoContext(repos))

it('should return a list of cards for a given list', async () => {
  // ARRANGE (Given)
  const listId = 5

  // ACT (When)
  const cardsFound = await find({ listId })

  // ASSERT (Then)
  expect(cardsFound).toMatchObject([
    {
      listId,
      title: 'Test card',
      order: 1,
    },
  ])
})
