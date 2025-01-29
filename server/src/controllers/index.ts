import { router } from '../trpc'
import board from './board'
import user from './user'
import list from './list'
import card from './card'
import template from './template'
import calendar from './calendar'
import activity from './activity'


export const appRouter = router({
  board,
  list,
  card,
  user,
  template,
  calendar,
  activity
})

export type AppRouter = typeof appRouter
