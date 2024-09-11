# svgviewer

## tree

```
html
  body
    div.container
      div.outer
        svg.svg
          g.inner
```

## coordinates

- div.container
  - same as `body`
  - 100vw x 100vh
  - content can grow (scrollWidth/scrollHeight)
  - overflow is hidden
  - scrollLeft/scrollTop changes during drag
- div.outer
  - can grow
- svg.svg
  - 100% x 100%
  - keep aspect ratio
  - viewBox changes
  - html coordinate
- g.inner
  - svg coordinate

## zoom

- decide focus point
- do CSS animation transform scale against .outer
- after animation end, reset CSS transform
- calculate viewBox & apply
