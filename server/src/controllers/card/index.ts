import { router } from '@server/trpc'
import create from './create'
import deleteById from './deleteById'
import find from './find'
import update from './update'
import addDueDate from './addDueDate'
import getDueDate from './getDueDate'

export default router({
  create,
  deleteById,
  find,
  update,
  addDueDate,
  getDueDate,
})
