export type Mode = 'zoom' | 'move'

export const modes = ['zoom', 'move']

export function toggleMode(mode: number): number {
  return (mode + 1) % modes.length
}
