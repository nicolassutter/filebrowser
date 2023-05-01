import type { GlobalComponents } from 'vue'
import type { UnwrapRef } from 'vue'

export type PathOption = {
  path: string
  type: 'directory' | 'file'
}

export type ComponentType<K extends keyof GlobalComponents> = GlobalComponents[K] extends new (...args: any[]) => infer R ? R : never
export type ComponentProps<K extends keyof GlobalComponents> = ComponentType<K>['$props']

export type OnlyComputeds<O extends Record<string, unknown>> = {
  [K in keyof O as O[K] extends ComputedRef<any> ? K : never]: O[K]
}

export type Reactify<O extends Record<string, unknown>> =
  & Omit<UnwrapRef<O>, keyof OnlyComputeds<O>>
  & Readonly<
    UnwrapRef<OnlyComputeds<O>>
  >
