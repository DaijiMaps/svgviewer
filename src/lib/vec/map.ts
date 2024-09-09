import { vec } from '.'
import { Vec } from '../vec'

export function map(v: Vec, f: (_n: number) => number): Vec {
  return vec(f(v.x), f(v.y))
}
export const mapF: (_f: (_a: number) => number) => (_fa: Vec) => Vec =
  (f) => (fa: Vec) =>
    vec(f(fa.x), f(fa.y))

export const map2 = (
  va: Vec,
  vb: Vec,
  f: (_a: number, _b: number) => number
): Vec => vec(f(va.x, vb.x), f(va.y, vb.y))

export const map2F: (
  _f: (_a: number, _b: number) => number
) => (_fa: Vec) => (_fb: Vec) => Vec = (f) => (fa: Vec) => (fb: Vec) =>
  vec(f(fa.x, fb.x), f(fa.y, fb.y))
