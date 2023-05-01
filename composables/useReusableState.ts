import type { Simplify } from 'type-fest'
import type { Reactify } from '~/types/utils'

/**
 * Creates a wrapper arround the state returned by the given composable.
 *
 * The proxy returned unwraps all accessed refs and computeds.
 * The computeds are typed as readonly.
 */
export function useReusableState<
  T extends Record<string, unknown>,
  Args extends unknown[],
>(composable: (...args: Args) => T) {
  return (...args: Args) => {
    const state = composable(...args)

    return new Proxy(state, {
      get(target, prop) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return unref((target as any)[prop])
      },

      set(target, prop, value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (isRef((target as any)[prop])) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(target as any)[prop].value = value
          return true
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(target as any)[prop] = value
        return true
      },
    }) as unknown as Simplify<Reactify<T>>
  }
}
