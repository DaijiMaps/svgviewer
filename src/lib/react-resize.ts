import { useEffect, useState } from 'react'
import { BoxBox as Box } from './box/prefixed'

export function getBodySize(): Box {
  return {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function useWindowResize(): Box {
  const [size, setSize] = useState(getBodySize())

  useEffect(() => {
    window.addEventListener('resize', () => {
      setSize(getBodySize())
    })
  }, [])

  return size
}
