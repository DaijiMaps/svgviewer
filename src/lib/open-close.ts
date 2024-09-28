export type OpenClose = Readonly<{
  open: boolean
  animating: boolean
}>

export function openCloseReset(open: boolean): OpenClose {
  return { open, animating: false }
}

export function openCloseOpen(prev: OpenClose): null | OpenClose {
  return prev.open || prev.animating
    ? null
    : {
        open: true,
        animating: true,
      }
}

export function openCloseOpened(prev: OpenClose): null | OpenClose {
  return !prev.open || !prev.animating
    ? null
    : {
        open: true,
        animating: false,
      }
}

export function openCloseClose(prev: OpenClose): null | OpenClose {
  return !prev.open || prev.animating
    ? null
    : {
        open: false,
        animating: true,
      }
}

export function openCloseClosed(prev: OpenClose): null | OpenClose {
  return prev.open || !prev.animating
    ? null
    : {
        open: false,
        animating: false,
      }
}

export function openCloseIsVisible({ open, animating }: OpenClose): boolean {
  return open || animating
}
