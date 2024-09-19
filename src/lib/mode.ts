export type Mode = 'pointing' | 'panning'

export const modes = ['pointing', 'panning']

export function toggleMode(mode: number): number {
  return (mode + 1) % modes.length
}
