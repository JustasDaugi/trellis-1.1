import { router } from '@server/trpc'
import format from './format'
import log from './log'
import get from './get'

export default router({
  format,
  log,
  get
})
