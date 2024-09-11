import { Vec } from './vec'

export function keyToDir(key: string): Vec {
  return {
    x: key === 'h' ? 1 : key === 'l' ? -1 : 0,
    y: key === 'k' ? 1 : key === 'j' ? -1 : 0,
  }
}

export function keyToZoom(key: string): number {
  return '=+iI'.indexOf(key) >= 0 ? 1 : '-_oO'.indexOf(key) >= 0 ? -1 : 0
}
