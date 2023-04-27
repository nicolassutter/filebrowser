import path from 'node:path'
import fs from 'node:fs/promises'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { publicProcedure, router } from '../trpc'
import { credentialsSchema } from '~/types/zod'

export const authRouter = router({
  checkCredentials: publicProcedure
    .input(credentialsSchema)
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      })

      // TODO: Match password

      return {
        userExists: !!result,
      }
    }),
})
