import type { PrismaClient } from '@prisma/client'

/**
 * Object that is auto imported everywhere in server-side code
 * This is used to store global variables related to Prisma.
 */
export const prismaServerStore = {
  /**
   * The Prisma instance that is instanciated in
   * the 1.serverInit.ts plugin.
   */
  prisma: undefined as undefined | PrismaClient,
}
