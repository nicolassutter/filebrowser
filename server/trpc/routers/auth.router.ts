import { TRPCError } from '@trpc/server'
import * as bcrypt from 'bcrypt'
import { omit } from 'lodash-es'
import { publicProcedure, router } from '../trpc'
import { credentialsSchema } from '~/types/zod'

export const authRouter = router({
  /**
   * Used to check if the provided credentials match
   * a user in the database.
   *
   * If they match, the user is returned.
   *
   * If not, an error is thrown.
   */
  checkCredentials: publicProcedure
    .input(credentialsSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bad credentials provided.',
        })
      }

      const passwordsMatch = await bcrypt.compare(input.password, user.password)

      if (!passwordsMatch) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bad credentials provided.',
        })
      }

      return omit(user, 'password')
    }),

  /**
   * Creates a new user in the database
   */
  register: publicProcedure
    .input(credentialsSchema)
    .mutation(async ({ ctx, input }) => {
      const areRegistrationsAllowed =
        process.env.ALLOW_REGISTRATIONS === undefined &&
        process.env.ALLOW_REGISTRATIONS === 'true'

      if (!areRegistrationsAllowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Registrations are not allowed.',
        })
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
        },
      })

      return user
    }),
})
