export interface Vec {
  x: number
  y: number
}

export function vec(x: number, y: number): Vec {
  return { x, y }
}

export const zero = vec(0, 0)
export const one = vec(1, 1)
