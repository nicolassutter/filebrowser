import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { TRPCError } from '@trpc/server'

/**
 * This plugin takes care of:
 *
 * - Instanciating Prisma
 * - Creating the first user in the database
 */
export default defineNitroPlugin(async () => {
  if (!prismaServerStore.prisma) {
    prismaServerStore.prisma = new PrismaClient()
  }

  const { caller } = await import('../trpc/routers/index')

  const USER_EMAIL = process.env.USER_EMAIL
  const USER_PASSWORD = process.env.USER_PASSWORD

  if (!USER_EMAIL || !USER_PASSWORD) {
    throw new Error(
      'Please provide a USER_EMAIL and USER_PASSWORD environment variable.',
    )
  }

  try {
    await caller.auth.register({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    })
  } catch (error) {
    /** @see https://www.prisma.io/docs/reference/api-reference/error-reference#p2002 */
    if (
      error instanceof TRPCError &&
      error.cause instanceof PrismaClientKnownRequestError &&
      error.cause.code === 'P2002'
    ) {
      // Do nothing, the user already exists
    }
  }
})
