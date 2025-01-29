import { connectToDatabase } from '@server/database/mongo'
import type { Log } from '@server/database/mongo/types'

export type LogInput = Omit<Log, 'timestamp'>

export function generateDescription(input: LogInput): string {
  const {
    userId,
    action,
    entityType,
    localTitle,
    listId,
    boardId,
    field,
    previousValue,
    newValue,
    previousDueDate,
    newDueDate,
  } = input

  if (
    field === 'dueDate' &&
    (previousDueDate !== undefined || newDueDate !== undefined)
  ) {
    return `User ${userId} ${action} the due date from "${
      previousDueDate ?? 'none'
    }" to "${newDueDate ?? 'none'}" in a ${entityType} titled "${localTitle}" in list ID ${listId}`
  } else if (field) {
    const changePart =
      previousValue !== undefined && newValue !== undefined
        ? `from "${previousValue}" to "${newValue}"`
        : ''
    return `User ${userId} ${action} ${field} ${changePart} in a ${entityType} titled "${localTitle}" in list ID ${boardId}`
  }
  return `User ${userId} ${action} a ${entityType} titled "${localTitle}" in board ID ${boardId}`
}

export function buildLog(input: LogInput, description: string): Log {
  const {
    cardId,
    listId,
    boardId,
    userId,
    action,
    entityType,
    localTitle,
    field,
    previousValue,
    newValue,
    previousDueDate,
    newDueDate,
  } = input

  return {
    cardId: cardId ?? null,
    listId,
    boardId,
    userId,
    action,
    entityType,
    localTitle: localTitle ?? null,
    field: field ?? null,
    previousValue: previousValue ?? null,
    newValue: newValue ?? null,
    previousDueDate: previousDueDate ?? null,
    newDueDate: newDueDate ?? null,
    description,
    timestamp: new Date(),
  }
}

export async function insertLog(logEntry: Log) {
  const { logs } = await connectToDatabase('activity_logs')
  await logs.insertOne(logEntry)
}
