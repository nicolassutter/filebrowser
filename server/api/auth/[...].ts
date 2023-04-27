import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { credentialsSchema } from '~/types/zod'

export default NuxtAuthHandler({
  // TODO: SET A STRONG SECRET, SEE https://sidebase.io/nuxt-auth/configuration/nuxt-auth-handler#secret
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  // TODO: ADD YOUR OWN AUTHENTICATION PROVIDER HERE, READ THE DOCS FOR MORE: https://sidebase.io/nuxt-auth
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      async authorize(credentials: unknown) {
        const parsedCredentials = credentialsSchema.safeParse(credentials)

        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // NOTE: THE BELOW LOGIC IS NOT SAFE OR PROPER FOR AUTHENTICATION!

        const user = {
          id: '1',
          name: 'J Smith',
          email: 'jsmith',
          password: 'hunter2',
        }

        if (!parsedCredentials.success) {
          return null
        }

        const { caller } = await import('../../trpc/routers/index')

        const { userExists } = await caller.auth.checkCredentials(
          parsedCredentials.data,
        )

        if (
          parsedCredentials.data.email === user.email &&
          parsedCredentials.data.password === user.password
        ) {
          // Any object returned will be saved in `user` property of the JWT
          return user
        } else {
          console.error(
            'Warning: Malicious login attempt registered, bad credentials provided',
          )

          // If you return null then an error will be displayed advising the user to check their details.
          return null

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
})
