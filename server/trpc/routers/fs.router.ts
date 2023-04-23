import path from 'node:path'
import fs from 'node:fs/promises'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { publicProcedure, router } from '../trpc'

export function isError(e: unknown): e is NodeJS.ErrnoException {
  return e instanceof Error
}

export const fsRouter = router({
  get: publicProcedure
    .input(
      z.object({
        path: z.string().default('/'),
      }),
    )
    .query(async ({ input }) => {
      const fullPath = path.resolve(input.path)

      try {
        const dirs = (await fs.readdir(fullPath, { withFileTypes: true }))
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name)

        return {
          directories: dirs,
          fullPath,
        }
      } catch (error) {
        if (isError(error)) {
          switch (error.code) {
            case 'EACCES':
              throw new TRPCError({
                code: 'FORBIDDEN',
                cause: error,
                message: 'EACCESS: permission denied',
              })

            default:
              throw new TRPCError({
                code: 'NOT_FOUND',
                cause: error,
                message: 'Directory does not exist',
              })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: error,
          message: 'Failed to read directory',
        })
      }
    }),
})
