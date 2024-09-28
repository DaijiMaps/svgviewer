import { Info } from './lib/config'

export interface ShopInfo {
  tag: 'shop'
  name?: string
  address?: string
}

export interface FacilityInfo {
  tag: 'facility'
  name?: string
  address?: string
}

declare module './lib/config' {
  interface Info {
    x: ShopInfo | FacilityInfo
  }
}

export type { Info }
