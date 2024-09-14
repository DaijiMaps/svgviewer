import { number as Number, ord as Ord, ordering as Ordering } from 'fp-ts'
import { Vec } from './main'

export const compare = (a: Vec, b: Vec): Ordering.Ordering =>
  Number.Ord.compare(a.x, b.x) || Number.Ord.compare(a.y, b.y)

export const ord = Ord.fromCompare(compare)
