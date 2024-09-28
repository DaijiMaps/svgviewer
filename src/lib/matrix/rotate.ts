import { M } from './main'

export function rotate(th: number): M {
  return [
    [Math.cos(th), -Math.sin(th)],
    [Math.sin(th), Math.cos(th)],
    [0, 0],
  ]
}
