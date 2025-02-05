import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import findById from './findById'
import sendResetLink from './sendResetLink'
import resetPassword from './resetPassword'

export default router({
  login,
  signup,
  findById,
  sendResetLink,
  resetPassword,
})
