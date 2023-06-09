import path from 'node:path'
import { readdir, rename, link, rm, mkdir } from 'node:fs/promises'
import { pathExists, copy } from 'fs-extra'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { authorizedProcedure, router } from '../trpc'

export function isError(e: unknown): e is NodeJS.ErrnoException {
  return e instanceof Error
}

/**
 * Takes in any error like object after an fs related error,
 * and formats it with `TRPCError`.
 *
 * The function always throws, so it needs to be wrapped by a try / catch
 * unless it is meant to always throw.
 */
function handleFsError(error: unknown) {
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

export const fsRouter = router({
  /**
   * Getting files and directories at the specified path
   */
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
        handleFsError(error)
      }
    }),

  /**
   * Item copy / move
   */
  copyOrMove: authorizedProcedure
    .input(
      z.object({
        paths: z.array(
          z.object({
            src: z.string(),
            dest: z.string(),
          }),
        ),
        action: z.union([z.literal('copy'), z.literal('move')]),
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

          if (input.action === 'copy') {
            await copy(src, dest)
          }

          if (input.action === 'move') {
            await rename(src, dest)
          }
        } catch (error) {
          handleFsError(error)
        }
      })

      await Promise.all(promises)

      return {
        errors,
      }
    }),

  /**
   * Items hard linking
   */
  link: authorizedProcedure
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

          await link(src, dest)
        } catch (error) {
          try {
            handleFsError(error)
          } catch (error) {
            // `handleFsError` always throws a formatted error
            errors.push(error as TRPCError)
          }
        }
      })

      await Promise.all(promises)

      return { errors }
    }),

  /**
   * Item deletion
   */
  delete: authorizedProcedure
    .input(
      z.object({
        paths: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const errors: TRPCError[] = []

      const promises = input.paths.map(async (itemPath) => {
        try {
          const pathToDeleteExists = await pathExists(itemPath)

          if (!pathToDeleteExists) {
            throw new Error('Path does not exist')
          }

          await rm(itemPath, {
            recursive: true,
          })
        } catch (error) {
          try {
            handleFsError(error)
          } catch (error) {
            // `handleFsError` always throws a formatted error
            errors.push(error as TRPCError)
          }
        }
      })

      await Promise.all(promises)

      return { errors }
    }),

  /**
   * Creates a directory
   */
  createDir: authorizedProcedure
    .input(
      z.object({
        path: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await mkdir(input.path, { recursive: true })
      } catch (error) {
        handleFsError(error)
      }
    }),
})
