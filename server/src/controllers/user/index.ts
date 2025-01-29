import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import findById from './findById'

export default router({
  login,
  signup,
  findById,
})
