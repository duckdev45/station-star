import { useEffect, useId, useState } from 'react'

/** 「站前之星」：塔頂旁的低調四芒星，載入時進場一次，之後緩慢明滅 */
export function StarMark({ x, y, size = 76 }: { x: number; y: number; size?: number }) {
  const id = useId().replace(/:/g, '')
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(r)
  }, [])
  return (
    <svg
      aria-hidden
      viewBox="-50 -50 100 100"
      className={`star pointer-events-none absolute z-[1] ${entered ? 'is-in' : ''}`}
      style={{ left: x - size / 2, top: y - size / 2, width: size, height: size }}
    >
      <defs>
        <radialGradient id={`${id}f`} r="0.5">
          <stop offset="0" stopColor="#fff6df" />
          <stop offset=".35" stopColor="#efcf8c" />
          <stop offset="1" stopColor="#d9a64a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}g`} r="0.5">
          <stop offset="0" stopColor="#f6d58f" stopOpacity=".35" />
          <stop offset="1" stopColor="#f6d58f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="glow" r="26" fill={`url(#${id}g)`} />
      <g className="rays">
        <path d="M0-48 1.6-1.6 34 0 1.6 1.6 0 48-1.6 1.6-34 0-1.6-1.6Z" fill={`url(#${id}f)`} />
        <path d="M0-15 .8-.8 15 0 .8.8 0 15-.8.8-15 0-.8-.8Z" fill={`url(#${id}f)`} transform="rotate(45)" opacity=".7" />
      </g>
      <circle r="1.8" fill="#fff8e8" />
    </svg>
  )
}
