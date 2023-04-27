import type { PrismaClient } from '@prisma/client'
import { router } from '../trpc'
import { authRouter } from './auth.router'
import { fsRouter } from './fs.router'

export const appRouter = router({
  fs: fsRouter,
  auth: authRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

export const caller = appRouter.createCaller({
  get prisma() {
    return prismaServerStore.prisma as PrismaClient
  },
})
