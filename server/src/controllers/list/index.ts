import { router } from '@server/trpc'
import create from './create'
import find from './find'
import deleteById from './deleteById'
import update from './update'


export default router({
  create,
  find,
  deleteById,
  update
})
