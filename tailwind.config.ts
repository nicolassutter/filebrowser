import type { Config } from 'tailwindcss'
import daisyUi from 'daisyui'
// import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  plugins: [daisyUi],
  theme: {
    extend: {},
  },
}
