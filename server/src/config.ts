import 'dotenv/config'
import { z } from 'zod'

const { env } = process

if (!env.NODE_ENV) env.NODE_ENV = 'development'
env.TZ = 'UTC' // Force UTC timezone

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

    s3: z.object({
      region: z.string().default('us-east-1'),
      accessKeyId: z.string().nonempty(),
      secretAccessKey: z.string().nonempty(),
      bucketName: z.string().nonempty(),
    }),
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

  s3: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    bucketName: env.S3_BUCKET_NAME,
  },
})

export default config

function coerceBoolean(value: unknown) {
  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }
  return undefined
}
