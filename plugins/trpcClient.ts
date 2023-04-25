import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import superjson from 'superjson'
import type { AppRouter } from '~/server/trpc/routers'

export default defineNuxtPlugin(() => {
  const client = createTRPCNuxtClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: '/api/trpc',
      }),
    ],
  })

  return {
    provide: {
      /**
       * Quick and dirty fix to issue https://github.com/wobsoriano/trpc-nuxt/issues/74
       */
      client: new Proxy(client, {
        get: function (target, prop) {
          if (prop === 'effect') {
            return undefined
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (target as any)[prop]
        },
      }),
    },
  }
})
