import path from 'node:path'
import fs from 'node:fs/promises'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { publicProcedure, router } from '../trpc'

export const authRouter = router({
  checkCredentials: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    )
    .query(async () => {
      return {}
    }),
})
