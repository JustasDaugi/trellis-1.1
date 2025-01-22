import { TRPCError } from '@trpc/server'

export default class InternalServerError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    })
  }
}
