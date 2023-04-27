import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import { NuxtAuthHandler } from '#auth'
import { credentialsSchema } from '~/types/zod'

export default NuxtAuthHandler({
  // TODO: SET A STRONG SECRET, SEE https://sidebase.io/nuxt-auth/configuration/nuxt-auth-handler#secret
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/login',
  },
  // TODO: ADD YOUR OWN AUTHENTICATION PROVIDER HERE, READ THE DOCS FOR MORE: https://sidebase.io/nuxt-auth
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      async authorize(credentials: unknown) {
        const parsedCredentials = credentialsSchema
          .merge(
            z.object({
              authType: z.union([z.literal('signIn'), z.literal('register')]),
            }),
          )
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { caller } = await import('../../trpc/routers/index')

        const { email, password, authType } = parsedCredentials.data

        if (authType === 'register') {
          try {
            const user = await caller.auth.register({ email, password })
            return user
          } catch (error) {
            return null
          }
        } else {
          try {
            const user = await caller.auth.checkCredentials({ email, password })
            return user
          } catch (error) {
            return null
          }
        }
      },
    }),
  ],
})
