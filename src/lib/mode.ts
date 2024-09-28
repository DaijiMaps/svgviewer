export type Mode = 'pointing' | 'panning' | 'detail'

export const modes = ['pointing', 'panning', 'detail']

export function toggleMode(mode: number): number {
  // XXX pointing <-> panning
  return (mode + 1) % 2
}
