import { Vec } from './main'

export function copy<T extends Vec>(v: T): T {
  return { ...v }
}
