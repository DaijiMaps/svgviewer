/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statements */

onmessage = function (e: Readonly<MessageEvent>) {
  const psvg = e.data.psvg

  const res = {
    psvg,
    name: `Found: POI: (${psvg.x},${psvg.y})`,
  }
  new Promise(() => this.postMessage(res))
}
