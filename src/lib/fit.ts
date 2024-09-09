import { Box } from './box'

const fitH = (o: Box, r: number) => [0, (o.height - o.width / r) / 2]

const fitV = (o: Box, r: number) => [(o.width - o.height * r) / 2, 0]

export const fit = (o: Box, i: Box) => {
  const R = o.width / o.height
  const r = i.width / i.height
  return R > r ? fitV(o, r) : fitH(o, r)
}
