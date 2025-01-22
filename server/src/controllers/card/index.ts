import { router } from '@server/trpc'
import create from './create'
import deleteById from './deleteById'
import find from './find'
import update from './update'

export default router({
    create,
    deleteById,
    find,
    update,
})