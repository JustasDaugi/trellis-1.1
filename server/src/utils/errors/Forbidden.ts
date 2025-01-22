import { TRPCError } from '@trpc/server'

export default class ForbiddenError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'FORBIDDEN',
      message,
    })
  }
}
