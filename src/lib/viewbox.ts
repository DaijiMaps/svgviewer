export class ViewBox extends DOMRect {
  constructor(x?: number, y?: number, width?: number, height?: number) {
    super(x, y, width, height)
  }

  toString() {
    return `${this.x} ${this.y} ${this.width} ${this.height}`
  }

  getCenter() {}

  move({ x, y }: DOMPointReadOnly) {
    this.x = this.x + x
    this.y = this.y + y
  }

  extend({ x, y }: DOMPointReadOnly) {
    this.x = this.x - x
    this.y = this.y - y
    this.width = this.width + x * 2
    this.height = this.height + y * 2
  }
}
