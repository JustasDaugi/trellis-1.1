import { MongoClient, Db } from 'mongodb'
import type { DB, Log } from './types'
import dotenv from 'dotenv'
import logger from '@server/utils/logger/logger'

dotenv.config()

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined in environment variables.')
}

const uri = process.env.MONGO_URI

const client = new MongoClient(uri)

let database: Db | null = null

export async function connectToDatabase(dbName: string): Promise<DB> {
  if (!database) {
    try {
      await client.connect()
      logger.info('Connected to MongoDB')
      database = client.db(dbName)
    } catch (error) {
      logger.error({ err: error }, 'Failed to connect to MongoDB')
      throw error
    }
  }

  return {
    logs: database.collection<Log>('logs'),
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close()
    logger.info('MongoDB connection closed')
    database = null
  }
}
