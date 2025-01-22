import { TRPCError } from '@trpc/server'

export default class UnauthorizedError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'UNAUTHORIZED',
      message,
    })
  }
}
