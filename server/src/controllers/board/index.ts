import { router } from '@server/trpc'
import create from './create'
import findAll from './findAll'
import get from './get'
import deleteById from './deleteById'
import update from './update'
import share from './share'
import getBoardMembers from './getBoardMembers'
import removeBoardMembers from './removeBoardMembers'
import getBoardOwner from './getBoardOwner'
import fetchData from './fetchData'

export default router({
  create,
  findAll,
  get,
  deleteById,
  update,
  share,
  getBoardMembers,
  removeBoardMembers,
  getBoardOwner,
  fetchData
})
