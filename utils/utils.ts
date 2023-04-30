import { v4 as uuid } from 'uuid'
import mitt from 'mitt'

export { uuid }

type Events = {
  resetAllChecked: string
}

export const emitter = mitt<Events>()
