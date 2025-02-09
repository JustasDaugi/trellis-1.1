import 'dotenv/config'
import { z } from 'zod'

const { env } = process

if (!env.NODE_ENV) env.NODE_ENV = 'development'
env.TZ = 'UTC' // fore utc

const isTest = env.NODE_ENV === 'test'
const isDevTest = env.NODE_ENV === 'development' || isTest

const schema = z
  .object({
    env: z
      .enum(['development', 'production', 'staging', 'test'])
      .default('development'),
    isCi: z.preprocess(coerceBoolean, z.boolean().default(false)),
    port: z.coerce.number().default(3000),

    auth: z.object({
      tokenKey: z.string().default(() => {
        if (isDevTest) {
          return 'supersecretkey'
        }
        throw new Error('You must provide a TOKEN_KEY in a production env!')
      }),
      expiresIn: z.string().default('7d'),
      passwordCost: z.coerce.number().default(isDevTest ? 6 : 12),
      resetPasswordExpiresIn: z.string().default('15m'),
    }),

    database: z.object({
      connectionString: z.string().url(),
    }),

    redis: z.object({
      url: z.string().url(),
      token: z.string()
    })

  })
  .readonly()

const config = schema.parse({
  env: env.NODE_ENV,
  port: env.PORT,
  isCi: env.CI,

  auth: {
    tokenKey: env.TOKEN_KEY,
    expiresIn: env.TOKEN_EXPIRES_IN,
    passwordCost: env.PASSWORD_COST,
    resetPasswordExpiresIn: env.RESET_PASSWORD_EXPIRES_IN,
  },

  database: {
    connectionString: env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  }
})

export default config

function coerceBoolean(value: unknown) {
  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }
  return undefined
}
