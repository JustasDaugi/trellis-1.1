import { fakeBoardTemplate, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import templateRouter from '..'

const createCaller = createCallerFactory(templateRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user] = await insertAll(db, 'user', fakeUser())

const { get } = createCaller({ db })

it('should return the template with null selectedBackground if none is set', async () => {
  // ARRANGE
  const [template] = await insertAll(db, 'boardTemplate', [
    fakeBoardTemplate({ userId: user.id, selectedBackground: null }),
  ])

  // ACT
  const result = await get(template.id)

  // ASSERT
  expect(result).toMatchObject({
    id: template.id,
    title: template.title,
    selectedBackground: null,
  })
})


it('should throw NotFoundError if the template does not exist', async () => {
  // ARRANGE
  const nonExistentTemplateId = 99999

  // ACT & ASSERT
  await expect(get(nonExistentTemplateId)).rejects.toThrow('Board not found')
})

