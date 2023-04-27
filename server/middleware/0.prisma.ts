import { PrismaClient } from '@prisma/client'

declare module 'h3' {
  interface H3EventContext {
    prisma: PrismaClient
  }
}

export default eventHandler((event) => {
  if (!prismaServerStore.prisma) {
    prismaServerStore.prisma = new PrismaClient()
  }

  event.context.prisma = prismaServerStore.prisma
})
