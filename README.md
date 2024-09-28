# svgmapviewer

https://svgmapviewer.pages.dev/

## tree

```
html
  body
    div.container
      svg.svg
```

## coordinates

- div.container
  - same as `body`
  - 100vw x 100vh
  - content can grow (scrollWidth/scrollHeight)
  - scrollLeft/scrollTop changes during drag (expanded)
    - overflow is hidden
- svg.svg
  - can grow ("expand")
  - keep aspect ratio
  - viewBox changes

## zoom

- decide focus point
- do CSS animation transform scale against svg.svg
- after animation end, reset CSS transform
- calculate viewBox & apply (recenter)
