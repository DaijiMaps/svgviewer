import { Vec } from './index'
import { vec } from './main'

export function map<T extends Vec>(v: T, f: (_n: number) => number): T {
  return { ...v, ...vec(f(v.x), f(v.y)) }
}

type __f = (_a: number) => number
export const mapF: <T extends Vec>(_f: __f) => (_fa: T) => T =
  <T extends Vec>(f: __f) =>
  (fa: T) => ({ ...fa, ...vec(f(fa.x), f(fa.y)) })

export const map2 = <T extends Vec>(
  va: T,
  vb: T,
  f: (_a: number, _b: number) => number
): T => ({ ...va, ...vec(f(va.x, vb.x), f(va.y, vb.y)) })

type __f2 = (_a: number, _b: number) => number
export const map2F: <T extends Vec>(_f: __f2) => (_fa: T) => (_fb: T) => Vec =
  <T extends Vec>(f: __f2) =>
  (fa: T) =>
  (fb: T) => ({
    ...fa,
    ...vec(f(fa.x, fb.x), f(fa.y, fb.y)),
  })
