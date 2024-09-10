import { useEffect, useState } from 'react'
import { Box } from './box'

export function getWindowSize(): Box {
  return {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function useWindowResize(): Box {
  const [size, setSize] = useState(getWindowSize())

  useEffect(() => {
    window.addEventListener('resize', () => {
      setSize(getWindowSize())
    })
  }, [])

  return size
}
