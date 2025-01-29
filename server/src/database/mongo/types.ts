import type { Collection } from 'mongodb'

export type Log = {
  readonly id?: string
  readonly cardId: number | null
  readonly listId: number
  readonly boardId: number
  readonly userId: number
  readonly action: 'created' | 'updated' | 'deleted'
  readonly entityType: 'card' | 'list'
  readonly localTitle: string | null
  readonly field?: string | null
  readonly previousValue?: any | null
  readonly newValue?: any | null
  readonly description: string
  readonly timestamp: Date
  readonly previousDueDate?: string | null
  readonly newDueDate?: string | null
}

export interface DB {
  [x: string]: any
  logs: Collection<Log>
}
