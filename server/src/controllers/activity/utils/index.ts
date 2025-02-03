import { connectToDatabase } from '@server/database/mongo'
import type { Log } from '@server/database/mongo/types'

export type LogInput = Omit<Log, 'timestamp'>

export function generateDescription(input: LogInput): string {
  const {
    userFirstName,
    action,
    entityType,
    localTitle,
    listTitle,
    boardTitle,
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
    return `User ${userFirstName} ${action} the due date from "${
      previousDueDate ?? 'none'
    }" to "${newDueDate ?? 'none'}" in a ${entityType} titled "${localTitle}" in list "${listTitle}" on board "${boardTitle}"`
  } else if (field) {
    const changePart =
      previousValue !== undefined && newValue !== undefined
        ? `from "${previousValue}" to "${newValue}"`
        : ''
    return `User ${userFirstName} ${action} ${field} ${changePart} in a ${entityType} titled "${localTitle}" in list "${listTitle}" on board "${boardTitle}"`
  }
  return `User ${userFirstName} ${action} a ${entityType} titled "${localTitle}" in board "${boardTitle}"`
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
    userFirstName,
    boardTitle,
    listTitle,
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
    userFirstName,
    boardTitle,
    listTitle,
  }
}

export async function insertLog(logEntry: Log) {
  const { logs } = await connectToDatabase('activity_logs')
  await logs.insertOne(logEntry)
}
