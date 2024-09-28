import { FacilityInfo, Info, ShopInfo } from './main-info'

export interface Props {
  info: Info
}

export function RenderInfo(props: Readonly<Props>) {
  return props.info.x.tag === 'shop'
    ? RenderShopInfo(props.info.x)
    : RenderFacilityInfo(props.info.x)
}

function RenderShopInfo(props: Readonly<ShopInfo>) {
  return (
    <>
      <p>{props.name}</p>
      <p>{props.address}</p>
    </>
  )
}

function RenderFacilityInfo(props: Readonly<FacilityInfo>) {
  return (
    <>
      <p>{props.name}</p>
      <p>{props.address}</p>
    </>
  )
}
