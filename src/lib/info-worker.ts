// eslint-disable-next-line functional/no-expression-statements, functional/no-return-void
onmessage = function (e: Readonly<MessageEvent>) {
  const psvg = e.data.psvg

  const res = {
    psvg,
    name: `Found: POI: (${psvg.x},${psvg.y})`,
  }
  // eslint-disable-next-line functional/no-expression-statements, functional/no-return-void
  new Promise(() => this.postMessage(res))
}
