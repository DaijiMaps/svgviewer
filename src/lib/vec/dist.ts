import { Vec } from '../vec'

export function dist(a: Vec, b: Vec): number {
  return Math.sqrt(qdist(a, b))
}

export function qdist(a: Vec, b: Vec): number {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
}
