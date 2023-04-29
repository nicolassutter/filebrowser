import path from 'node:path'
import { readdir } from 'node:fs/promises'
import { pathExists, copy } from 'fs-extra'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { authorizedProcedure, router } from '../trpc'

export function isError(e: unknown): e is NodeJS.ErrnoException {
  return e instanceof Error
}

export const fsRouter = router({
  get: authorizedProcedure
    .input(
      z.object({
        path: z.string().default('/'),
      }),
    )
    .query(async ({ input }) => {
      const fullPath = path.resolve(input.path)

      try {
        const readResult = await readdir(fullPath, { withFileTypes: true })

        const directories = readResult
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name)

        const files = readResult
          .filter((dirent) => dirent.isFile())
          .map((dirent) => dirent.name)

        return {
          directories,
          files,
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

  copy: authorizedProcedure
    .input(
      z.object({
        paths: z.array(
          z.object({
            src: z.string(),
            dest: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const errors: TRPCError[] = []

      const promises = input.paths.map(async ({ src, dest }) => {
        try {
          const srcExists = await pathExists(src)
          const destExists = await pathExists(dest)

          if (!srcExists) {
            throw new Error('Path does not exist')
          }

          if (destExists) {
            throw new Error('Destination path already exists')
          }

          await copy(src, dest)
        } catch (error) {
          if (isError(error)) {
            switch (error.code) {
              case 'EACCES':
                errors.push(
                  new TRPCError({
                    code: 'FORBIDDEN',
                    cause: error,
                    message: 'EACCESS: permission denied',
                  }),
                )
                return

              default:
                errors.push(
                  new TRPCError({
                    code: 'NOT_FOUND',
                    cause: error,
                    message: 'Directory does not exist',
                  }),
                )
                return
            }
          }

          errors.push(
            new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              cause: error,
              message: 'Failed to read directory',
            }),
          )
        }
      })

      await Promise.all(promises)

      return {
        errors,
      }
    }),
})
