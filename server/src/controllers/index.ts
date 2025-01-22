import { router } from '../trpc'
import board from './board'
import user from './user'
import list from './list'
import card from './card'
import template from './template'


export const appRouter = router({
  board,
  list,
  card,
  user,
  template,
})

export type AppRouter = typeof appRouter
