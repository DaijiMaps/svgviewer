export type Vec = Readonly<{
  x: number
  y: number
}>

////
////
////
////
////

const vecAdd = <T extends Vec>(a: T, b: T): T => ({
  ...a,
  x: a.x + b.x,
  y: a.y + b.y,
})
const vecSub = <T extends Vec>(a: T, b: T): T => ({
  ...a,
  x: a.x - b.x,
  y: a.y - b.y,
})
const vecMul = <T extends Vec>(a: T, b: T): T => ({
  ...a,
  x: a.x * b.x,
  y: a.y * b.y,
})
const vecDiv = <T extends Vec>(a: T, b: T): T => ({
  ...a,
  x: a.x / b.x,
  y: a.y / b.y,
})

const vecFmap =
  <T extends Vec>(f: (n: number) => number) =>
  (a: T): T => ({
    ...a,
    x: f(a.x),
    y: f(a.y),
  })

const vecScale = <T extends Vec>(v: T, s: number): T => ({
  ...v,
  ...vecFmap((n) => n * s)(v),
})

const vecInterpolate = <T extends Vec>(p: T, q: T, t: number): T =>
  vecAdd(vecScale(q, t), vecScale(p, 1 - t))

export { vecAdd, vecDiv, vecFmap, vecInterpolate, vecMul, vecScale, vecSub }
