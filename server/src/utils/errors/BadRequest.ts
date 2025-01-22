import { TRPCError } from '@trpc/server'

export default class BadRequestError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'BAD_REQUEST',
      message,
    })
  }
}
