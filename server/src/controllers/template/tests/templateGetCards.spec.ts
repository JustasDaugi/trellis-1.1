import { fakeCardTemplate } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import cardRouter from '..'

const createCaller = createCallerFactory(cardRouter)
const db = await wrapInRollbacks(createTestDatabase())

await clearTables(db, ['cardTemplate'])

const { getCards } = createCaller({ db })

it('should return cards with their correct properties for the given listId', async () => {
  // ARRANGE
  const listId = 1;
  const cards = await insertAll(db, 'cardTemplate', [
    fakeCardTemplate({ listId, title: 'Card 1', description: 'Description 1' }),
    fakeCardTemplate({ listId, title: 'Card 2', description: 'Description 2' }),
  ]);

  // ACT
  const result = await getCards({ listId });

  // ASSERT
  expect(result).toEqual(
    expect.arrayContaining(
      cards.map(({ id, title, description }) =>
        expect.objectContaining({ id, title, description })
      )
    )
  );
});


it('should return an empty array if no cards exist for the given listId', async () => {
  // ARRANGE
  const listId = 1

  // ACT
  const result = await getCards({ listId })

  // ASSERT
  expect(result).toEqual([])
})