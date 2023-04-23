import { router } from '../trpc'
import { fsRouter } from './fs.router'

export const appRouter = router({
  fs: fsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
