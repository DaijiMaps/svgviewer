export const zoomInCenter: Readonly<DOMMatrixReadOnly> = new DOMMatrixReadOnly()
  .translate(0.5, 0.5)
  .scale(2, 2)
  .translate(-0.5, -0, 5)

export const zoomOutCenter: Readonly<DOMMatrixReadOnly> =
  new DOMMatrixReadOnly()
    .translate(0.5, 0.5)
    .scale(0.5, 0.5)
    .translate(-0.5, -0, 5)
