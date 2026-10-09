import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import buildingUrl from '../../assets/building.webp'
import { freeCount, unitsOf, zoneOf } from '../../data/floors'
import { ZONES } from '../../data/project'
import { FLOOR_PITCH, TOWER_FLOORS, TOWER_IMG, VB, towerFloor } from '../../data/tower'
import { useFloor } from '../../state/floorState'
import { useElementSize } from '../../state/useElementSize'
import { MD_QUERY, useMediaQuery } from '../../state/useMediaQuery'
import { StarMark } from './StarMark'

const RAIL_W = 150
const MULTI_ZONES = ZONES.filter((z) => z.range[1] > z.range[0])

export function Tower() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(wrapRef)
  const isMd = useMediaQuery(MD_QUERY)
  const { active, preview, locked, setPreview, lock, step } = useFloor()

  const H = Math.max(0, height - 4)
  const scale = H / VB.h
  const W = VB.w * scale
  const total = W + RAIL_W + (isMd ? 64 : 10)
  const left = Math.max(6, (width - total) / 2)
  const railX = (TOWER_IMG.w - VB.x) * scale + 14
  const yOf = (f: number) => (towerFloor(f).midY - VB.y) * scale
  const rowH = Math.max(16, Math.min(24, FLOOR_PITCH * scale - 2))

  // 鍵盤上下切換後，把焦點移到新樓層
  const focusAfterStep = useRef(false)
  useEffect(() => {
    if (!focusAfterStep.current) return
    focusAfterStep.current = false
    wrapRef.current?.querySelector<HTMLButtonElement>(`[data-floor="${locked}"]`)?.focus()
  }, [locked])

  const activeZone = zoneOf(active).id

  return (
    <div ref={wrapRef} className="relative mt-2.5 min-h-0 flex-1">
      {H > 0 && <StarMark x={left + 0.93 * W} y={(40 - VB.y) * scale - 76} />}
      {H > 0 && (
        <div
          className="absolute top-0"
          style={{ left, width: total }}
          data-mode={preview != null ? 'hover' : 'idle'}
          onPointerLeave={() => setPreview(null)}
        >
          <TowerSvg width={W} height={H} active={active} hovering={preview != null} onPreview={setPreview} onLock={lock} />
          <div
            className="absolute top-0"
            style={{ left: railX, width: RAIL_W }}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
              e.preventDefault()
              focusAfterStep.current = true
              step(e.key === 'ArrowUp' ? 1 : -1)
            }}
          >
            {TOWER_FLOORS.map(({ floor: f }) => {
              const units = unitsOf(f), n = freeCount(f), on = f === active
              const status = n ? (n === units.length ? '整層可租' : `${n} 戶可租`) : 'Occupied'
              return (
                <button
                  key={f}
                  type="button"
                  data-floor={f}
                  aria-label={`${f}F ${zoneOf(f).name}，${n ? `${n} 戶可租` : '已全數出租'}`}
                  className={`floor-row absolute left-0 flex -translate-y-1/2 cursor-pointer items-center gap-[9px] rounded-[3px] pr-1.5 pl-3.5 text-xs whitespace-nowrap text-on-umber-2 ${on ? 'is-active bg-gold/14' : ''}`}
                  style={{ top: yOf(f), height: rowH }}
                  onPointerOver={(e) => e.pointerType === 'mouse' && setPreview(f)}
                  onClick={() => lock(f)}
                >
                  <span className={`w-[30px] text-right font-serif font-semibold ${on ? 'text-[15px] text-gold-soft' : n ? 'text-[13px] text-on-umber' : 'text-[13px] text-dim'}`}>
                    {f}F
                  </span>
                  <span className="flex gap-1">
                    {units.map((u) => (
                      <i key={u.id} className={`size-[7px] rounded-full border ${u.occ ? 'border-dim' : 'border-gold bg-gold'}`} />
                    ))}
                  </span>
                  <span className={n ? 'text-gold-soft' : ''}>{status}</span>
                </button>
              )
            })}
            {MULTI_ZONES.map((z) => {
              const top = yOf(z.range[1]) - 10, bottom = yOf(z.range[0]) + 10
              const on = z.id === activeZone
              return (
                <div
                  key={z.id}
                  className={`zone-bracket absolute hidden w-[26px] items-center justify-center border-l font-serif text-[13px] tracking-[.42em] transition-colors md:flex ${on ? 'border-gold-soft text-gold-soft' : 'border-gold/30 text-[#9c8b77]'}`}
                  style={{ top, height: bottom - top, left: RAIL_W + 2 }}
                >
                  {z.name}
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="absolute top-0 right-3 z-[3] flex gap-2 md:hidden">
        {[[1, '上一層', '▲'], [-1, '下一層', '▼']].map(([d, label, icon]) => (
          <button
            key={label}
            type="button"
            aria-label={label as string}
            onClick={() => step(d as number)}
            className="size-11 cursor-pointer rounded-full border border-umber-line bg-umber/70 text-lg text-on-umber"
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}

interface TowerSvgProps {
  width: number
  height: number
  active: number
  hovering: boolean
  onPreview: (f: number) => void
  onLock: (f: number) => void
}

/** 去背外觀圖 + 目前樓層「抽出」的切片 */
function TowerSvg({ width, height, active, hovering, onPreview, onLock }: TowerSvgProps) {
  const id = useId().replace(/:/g, '')
  const sliceRef = useRef<SVGGElement>(null)
  const prev = useRef<number | null>(null)
  const points = towerFloor(active).points
  const occ = freeCount(active) === 0

  // 換樓層時：先無動畫歸位，再滑出
  useLayoutEffect(() => {
    const el = sliceRef.current
    if (!el) return
    if (prev.current !== active) {
      el.style.transition = 'none'
      el.style.transform = 'translate(0px,0px)'
      el.getBoundingClientRect()
      el.style.transition = ''
      prev.current = active
    }
    el.style.transform = hovering ? 'translate(14px,-1px)' : 'translate(10px,-1px)'
  }, [active, hovering])

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      className="block overflow-visible"
      role="img"
      aria-label="福懋站前之星外觀，可點選樓層"
    >
      <defs>
        <clipPath id={`${id}clip`}>
          <polygon points={points} />
        </clipPath>
        <filter id={`${id}lift`} x="-30%" y="-60%" width="160%" height="220%">
          <feDropShadow dx="-2" dy="6" stdDeviation="4" floodColor="#0d0805" floodOpacity=".7" />
        </filter>
        <filter id={`${id}warm`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values=".96 0 0 0 .17  0 .9 0 0 .11  0 0 .76 0 .03  0 0 0 1 0" />
        </filter>
        <radialGradient id={`${id}ground`}>
          <stop offset="0" stopColor="#000" stopOpacity=".65" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="912" rx="175" ry="12" fill={`url(#${id}ground)`} />
      <image className="tower-base" href={buildingUrl} width={TOWER_IMG.w} height={TOWER_IMG.h} preserveAspectRatio="none" />
      <g ref={sliceRef} className={`tower-slice ${occ ? 'is-occ' : ''}`}>
        <g filter={`url(#${id}lift)`}>
          <image
            href={buildingUrl}
            width={TOWER_IMG.w}
            height={TOWER_IMG.h}
            preserveAspectRatio="none"
            clipPath={`url(#${id}clip)`}
            filter={`url(#${id}warm)`}
          />
        </g>
        <polygon className="tower-slice-edge" points={points} />
      </g>
      <g>
        {TOWER_FLOORS.map((t) => (
          <polygon
            key={t.floor}
            className="tower-hit"
            points={t.points}
            onPointerOver={(e) => e.pointerType === 'mouse' && onPreview(t.floor)}
            onClick={() => onLock(t.floor)}
          />
        ))}
      </g>
    </svg>
  )
}
