import { router } from '@server/trpc'
import copy from './copy'
import getBoards from './getBoards'
import getLists from './getLists'
import getCards from './getCards'
import get from './get'

export default router({
  copy,
  getBoards,
  getLists,
  getCards,
  get
})
