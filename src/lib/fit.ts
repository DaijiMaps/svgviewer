import { BoxBox as Box } from './box/prefixed'
import { V } from './matrix'

const fitH = (o: Box, r: number): V => [0, (o.height - o.width / r) / 2]

const fitV = (o: Box, r: number): V => [(o.width - o.height * r) / 2, 0]

export const fit = (o: Box, i: Box): [[x: number, y: number], s: number] => {
  const R = o.width / o.height
  const r = i.width / i.height
  const v = R > r ? fitV(o, r) : fitH(o, r)
  const s = R > r ? i.height / o.height : i.width / o.width
  return [v, s]
}
