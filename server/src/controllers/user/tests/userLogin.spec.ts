import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import { insertAll } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())
const PASSWORD_CORRECT = 'Password.123!'

const [userSeed] = await insertAll(db, 'user', [
  fakeUser({
    email: 'existing@user.com',
    password: '$2b$10$FWjtmWY4xcPGx5KwYoyJH.s/UsY0ykvdqKE6KU7N0yNQJtryPx9qu',
  }),
])

const { login } = createCaller({ db } as any)

it('returns a token if the password matches', async () => {
  const { accessToken } = await login({
    email: userSeed.email,
    password: PASSWORD_CORRECT,
  })

  // jwt
  expect(accessToken).toEqual(expect.any(String))
  expect(accessToken.slice(0, 3)).toEqual('eyJ')
})

it('should throw an error for non-existant user', async () => {
  await expect(
    login({
      email: 'nonexisting@user.com',
      password: PASSWORD_CORRECT,
    })
  ).rejects.toThrow()
})

it('should throw an error for incorrect password', async () => {
  expect(
    login({
      email: userSeed.email,
      password: 'password.123!',
    })
  ).rejects.toThrow(/password/i)
})

it('throws an error for invalid email', async () => {
  await expect(
    login({
      email: 'not-an-email',
      password: PASSWORD_CORRECT,
    })
  ).rejects.toThrow(/email/)
})

it('throws an error for a short password', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'short',
    })
  ).rejects.toThrow(/password/)
})

it('allows logging in with different email case', async () => {
  await expect(
    login({
      email: userSeed.email.toUpperCase(),
      password: PASSWORD_CORRECT,
    })
  ).resolves.toEqual(expect.anything())
})

it('allows logging in with surrounding white space', async () => {
  await expect(
    login({
      email: ` \t ${userSeed.email}\t `,
      password: PASSWORD_CORRECT,
    })
  ).resolves.toEqual(expect.anything())
})

it('should reject a password longer than 64 characters', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'A'.repeat(65),
    })
  ).rejects.toThrow(/password/)
})

it('should reject a password without an uppercase letter', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'lowercase123!',
    })
  ).rejects.toThrow(/password/)
})

it('should reject a password without a lowercase letter', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'UPPERCASE123!',
    })
  ).rejects.toThrow(/password/)
})

it('should reject a password without a number', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'NoNumbers!',
    })
  ).rejects.toThrow(/password/)
})

it('should reject a password without a special character', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'NoSpecial123',
    })
  ).rejects.toThrow(/password/)
})

it('should reject a password with spaces', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'With Spaces1!',
    })
  ).rejects.toThrow(/password/)
})
