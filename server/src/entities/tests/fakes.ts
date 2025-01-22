import type {
  Board,
  BoardTemplate,
  List,
  ListTemplate,
  Card,
  CardTemplate,
  User,
} from '@server/database/types'
import type { Insertable } from 'kysely'
import { random } from '@tests/utils/random'
import type { AuthUser } from '../user'

const randomId = () =>
  random.integer({
    min: 1,
    max: 1000000,
  })

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<Insertable<User>>>(
  overrides: T = {} as T
) =>
  ({
    email: random.email(),
    firstName: random.first(),
    lastName: random.last(),
    password: 'Password.123!',
    ...overrides,
  }) satisfies Insertable<User>

export const fakeAuthUser = <T extends Partial<AuthUser>>(
  overrides: T = {} as T
): AuthUser => ({
  id: randomId(),
  email: random.email(),
  ...overrides,
})

/**
 * Generates a fake board with default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeBoard = <T extends Partial<Insertable<Board>>>(overrides: T) =>
  ({
    title: random.string(),
    selectedBackground: random.string() || null,
    userId: randomId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) satisfies Insertable<Board>

/**
 * Generates a fake list with default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeList = <T extends Partial<Insertable<List>>>(overrides: T) =>
  ({
    title: random.string(),
    order: random.integer({ min: 0, max: 1000 }),
    userId: randomId(),
    boardId: randomId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) satisfies Insertable<List>

/**
 * Generates a fake card with default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeCard = <T extends Partial<Insertable<Card>>>(overrides: T) =>
  ({
    title: random.string(),
    description: random.paragraph(),
    order: random.integer({ min: 0, max: 1000 }),
    userId: randomId(),
    listId: randomId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) satisfies Insertable<Card>


/**
 * Generates a fake board template with default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeBoardTemplate = <T extends Partial<Insertable<BoardTemplate>>>(
  overrides: T = {} as T
) =>
  ({
    title: random.string(),
    selectedBackground: overrides.selectedBackground ?? null, // Explicitly handle overrides or default to null
    userId: randomId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) satisfies Insertable<BoardTemplate>

/**
 * Generates a fake list template with default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeListTemplate = <T extends Partial<Insertable<ListTemplate>>>(
  overrides: T = {} as T
) =>
  ({
    title: random.string(),
    order: random.integer({ min: 0, max: 1000 }),
    boardId: randomId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) satisfies Insertable<ListTemplate>

/**
 * Generates a fake card template with default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeCardTemplate = <T extends Partial<Insertable<CardTemplate>>>(
  overrides: T = {} as T
) =>
  ({
    title: random.string(),
    description: random.paragraph(),
    order: random.integer({ min: 0, max: 1000 }),
    listId: randomId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) satisfies Insertable<CardTemplate>