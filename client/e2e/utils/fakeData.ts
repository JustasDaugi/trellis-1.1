import type {
  User,
  Board,
  List,
  Card,
  BoardTemplate,
  ListTemplate,
  CardTemplate,
  AuthUser,
} from '@server/shared/types';
import type { Insertable } from 'kysely';
import { Chance } from 'chance';

// Initialize Chance for generating random data
export const random = process.env.CI ? Chance(1) : Chance();

/**
 * Creates a new user with a random email and password. We use random emails
 * to avoid collisions when running tests against a real database.
 */
export const fakeUser = <T extends Insertable<User>>(overrides: Partial<T> = {} as T) => ({
  email: random.email(),
  password: 'password.123',
  firstName: random.first(),
  lastName: random.last(),
  ...overrides,
});

/**
 * Creates a fake AuthUser object with minimal properties needed for tests.
 */
export const fakeAuthUser = <T extends Partial<AuthUser>>(overrides: T = {} as T) => ({
  id: random.guid(),
  email: random.email(),
  password: 'password.123', // Add a default password for authentication
  ...overrides,
});

/**
 * Creates a fake board with minimal properties needed for E2E tests.
 */
export const fakeBoard = <T extends Partial<Insertable<Board>>>(overrides: T = {} as T) => ({
  title: random.sentence({ words: 3 }),
  selectedBackground: random.color(),
  ...overrides,
});

/**
 * Creates a fake list with minimal properties needed for E2E tests.
 */
export const fakeList = <T extends Partial<Insertable<List>>>(overrides: T = {} as T) => ({
  title: random.word(),
  order: random.integer({ min: 0, max: 1000 }),
  ...overrides,
});

/**
 * Creates a fake card with minimal properties needed for E2E tests.
 */
export const fakeCard = <T extends Partial<Insertable<Card>>>(overrides: T = {} as T) => ({
  title: random.sentence({ words: 5 }),
  description: random.paragraph(),
  ...overrides,
});

/**
 * Creates a fake board template with the same properties as fakeBoard.
 */
export const fakeBoardTemplate = <
  T extends Partial<Insertable<BoardTemplate>>
>(
  overrides: T = {} as T
) => ({
  title: random.sentence({ words: 3 }),
  selectedBackground: random.color(),
  ...overrides,
});

/**
 * Creates a fake list template with the same properties as fakeList.
 */
export const fakeListTemplate = <
  T extends Partial<Insertable<ListTemplate>>
>(
  overrides: T = {} as T
) => ({
  title: random.word(),
  order: random.integer({ min: 0, max: 1000 }),
  ...overrides,
});

/**
 * Creates a fake card template with the same properties as fakeCard.
 */
export const fakeCardTemplate = <
  T extends Partial<Insertable<CardTemplate>>
>(
  overrides: T = {} as T
) => ({
  title: random.sentence({ words: 5 }),
  description: random.paragraph(),
  ...overrides,
});
