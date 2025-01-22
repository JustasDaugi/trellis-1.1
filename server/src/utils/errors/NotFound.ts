import { TRPCError } from '@trpc/server'

export default class NotFoundError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'NOT_FOUND',
      message,
    })
  }
}
