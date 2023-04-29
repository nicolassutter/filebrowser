import type { Options as UnpluginIconsOptions } from 'unplugin-icons/types'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@nuxtjs/tailwindcss',
    '@huntersofbook/naive-ui-nuxt',
    [
      'unplugin-icons/nuxt',
      <UnpluginIconsOptions>{
        /* options */
      },
    ],
  ],
  build: {
    transpile: ['trpc-nuxt'],
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  typescript: {
    shim: false,
  },
  auth: {
    enableGlobalAppMiddleware: true,
    enableSessionRefreshPeriodically: 60000,
  },
})
