import { createTestDatabase } from '@tests/utils/database'
import { fakeUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { selectAll } from '@tests/utils/records'
import { random } from '@tests/utils/random'
import userRouter from '..'
import jwt from 'jsonwebtoken'
import config from '@server/config'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(userRouter)
const { signup, resetPassword } = createCaller({ db })

it('should reset the password given a valid token and matching email', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await resetPassword({
    email: user.email,
    password: 'NewPassword1!',
    token: validToken,
  })

  const [updatedUser] = await selectAll(db, 'user', (eb) =>
    eb('email', '=', user.email)
  )
  expect(updatedUser).toMatchObject({
    id: expect.any(Number),
    email: user.email.toLowerCase(),
    password: expect.any(String),
  })
  expect(updatedUser.password).toHaveLength(60)
  expect(updatedUser.password).not.toContain('NewPassword1!')
})

it('should throw NotFoundError if user does not exist', async () => {
  const user = fakeUser()
  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'NewPassword1!',
      token: validToken,
    })
  ).rejects.toThrow(/User not found/i)
})

it('should throw an error for invalid or expired token', async () => {
  const user = fakeUser()
  await signup(user)

  await expect(
    resetPassword({
      email: user.email,
      password: 'NewPassword1!',
      token: 'invalid.token.value',
    })
  ).rejects.toThrow(/Invalid or expired token/i)
})

it('should throw an error if the token email does not match the user email', async () => {
  const user = fakeUser()
  await signup(user)

  const otherEmail = random.email()
  const invalidToken = jwt.sign({ email: otherEmail }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'NewPassword1!',
      token: invalidToken,
    })
  ).rejects.toThrow(/expired token/i)
})

it('should require a valid email', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: 'not-valid-email',
      password: 'NewPassword1!',
      token: validToken,
    })
  ).rejects.toThrow(/email/i)
})

it('should require a password with at least 8 characters', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'pas.123',
      token: validToken,
    })
  ).rejects.toThrow(/password/i)
})

it('should reject a password longer than 64 characters', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'A'.repeat(65),
      token: validToken,
    })
  ).rejects.toThrow(/password/i)
})

it('should reject a password without an uppercase letter', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'lowercase123!',
      token: validToken,
    })
  ).rejects.toThrow(/password/i)
})

it('should reject a password without a lowercase letter', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'UPPERCASE123!',
      token: validToken,
    })
  ).rejects.toThrow(/password/i)
})

it('should reject a password without a number', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'NoNumbers!',
      token: validToken,
    })
  ).rejects.toThrow(/password/i)
})

it('should reject a password without a special character', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'NoSpecial123',
      token: validToken,
    })
  ).rejects.toThrow(/password/i)
})

it('should reject a password with spaces', async () => {
  const user = fakeUser()
  await signup(user)

  const validToken = jwt.sign({ email: user.email }, config.auth.tokenKey, {
    expiresIn: '1h',
  })

  await expect(
    resetPassword({
      email: user.email,
      password: 'With Spaces1!',
      token: validToken,
    })
  ).rejects.toThrow(/password/i)
})
