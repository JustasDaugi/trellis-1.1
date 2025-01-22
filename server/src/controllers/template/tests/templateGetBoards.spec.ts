import { fakeBoardTemplate, fakeUser } from '@server/entities/tests/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { clearTables, insertAll } from '@tests/utils/records';
import templateRouter from '..';

const createCaller = createCallerFactory(templateRouter);
const db = await wrapInRollbacks(createTestDatabase());

await clearTables(db, ['boardTemplate']);
const [user] = await insertAll(db, 'user', fakeUser());

const { getBoards } = createCaller({ db });

it('should return an empty array if no templates exist', async () => {
  // ARRANGE
  // No templates inserted.

  // ACT
  const result = await getBoards();

  // ASSERT
  expect(result).toEqual([]);
});

it('should return templates with their correct properties', async () => {
  // ARRANGE
  const [template1, template2] = await insertAll(db, 'boardTemplate', [
    fakeBoardTemplate({ userId: user.id, title: 'Template 1' }),
    fakeBoardTemplate({ userId: user.id, title: 'Template 2' }),
  ]);

  // ACT
  const result = await getBoards();

  // ASSERT
  expect(result).toHaveLength(2);
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: template1.id,
        title: 'Template 1',
      }),
      expect.objectContaining({
        id: template2.id,
        title: 'Template 2',
      }),
    ])
  );
});

