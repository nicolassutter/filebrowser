import type { GlobalComponents } from 'vue'

export type PathOption = {
  path: string
  type: 'directory' | 'file'
}

export type ComponentType<K extends keyof GlobalComponents> = GlobalComponents[K] extends new (...args: any[]) => infer R ? R : never
export type ComponentProps<K extends keyof GlobalComponents> = ComponentType<K>['$props']
