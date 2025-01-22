import type { Database } from '@server/database'
import { boardRepository } from './boardRepository'
import { listRepository } from './listRepository'
import { cardRepository } from './cardRepository'
import { userRepository } from './userRepository'
import { templateRepository } from './templateRepository'

export type RepositoryFactory = <T>(db: Database) => T

const repositories = {
  boardRepository,
  listRepository,
  cardRepository,
  userRepository,
  templateRepository
}

export type RepositoriesFactories = typeof repositories
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>
}
export type RepositoriesKeys = keyof Repositories

export { repositories }
