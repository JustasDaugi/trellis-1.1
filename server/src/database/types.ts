import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Board {
  createdAt: Generated<Timestamp>
  id: Generated<number>
  selectedBackground: string | null
  title: string
  updatedAt: Generated<Timestamp>
  userId: number
}

export interface BoardTemplate {
  createdAt: Generated<Timestamp>
  id: Generated<number>
  selectedBackground: string | null
  title: string
  updatedAt: Generated<Timestamp>
  userId: number
}

export interface Card {
  createdAt: Generated<Timestamp>
  description: string | null
  id: Generated<number>
  listId: number
  order: number | null
  title: string
  updatedAt: Generated<Timestamp>
  userId: number
}

export interface CardTemplate {
  createdAt: Generated<Timestamp>
  description: string | null
  id: Generated<number>
  listId: number
  order: number | null
  title: string
  updatedAt: Generated<Timestamp>
}

export interface List {
  boardId: number
  createdAt: Generated<Timestamp>
  id: Generated<number>
  order: number | null
  title: string
  updatedAt: Generated<Timestamp>
  userId: number
}

export interface ListTemplate {
  boardId: number
  createdAt: Generated<Timestamp>
  id: Generated<number>
  order: number | null
  title: string
  updatedAt: Generated<Timestamp>
}

export interface User {
  boardId: number | null
  email: string
  firstName: string
  id: Generated<number>
  lastName: string
  password: string
}

export interface DB {
  board: Board
  boardTemplate: BoardTemplate
  card: Card
  cardTemplate: CardTemplate
  list: List
  listTemplate: ListTemplate
  user: User
}
