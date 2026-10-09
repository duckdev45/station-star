import { useEffect, useRef } from 'react'
import { typeOf, unitsOf } from '../../data/floors'
import { PRESETS } from '../../data/project'
import type { FloorStats } from '../../data/types'
import { FloorPlanEngine } from '../../engine/FloorPlanEngine'
import { useFloor } from '../../state/floorState'
import { prefersReducedMotion } from '../../state/useElementSize'

/** 切換樓層時稍等一下再重建 3D，避免滑過大樓時一直重算 */
const SHOW_DELAY = 110

export function FloorPlanView({ onStats }: { onStats: (s: FloorStats | null) => void }) {
  const viewRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<FloorPlanEngine | null>(null)
  const { active, layout, hotUnit, setHot, setPreset } = useFloor()
  const setHotRef = useRef(setHot)
  setHotRef.current = setHot

  useEffect(() => {
    const engine = new FloorPlanEngine(viewRef.current!, labelsRef.current!, {
      reducedMotion: prefersReducedMotion(),
      tooltip: tipRef.current,
      onHoverUnit: (side) => setHotRef.current(side),
    })
    engineRef.current = engine
    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    const req = { type: typeOf(active), layout, units: unitsOf(active) }
    onStats(engine.peek(req))
    const t = window.setTimeout(() => onStats(engine.show(req)), SHOW_DELAY)
    return () => window.clearTimeout(t)
  }, [active, layout, onStats])

  useEffect(() => engineRef.current?.setHot(hotUnit), [hotUnit])

  const isStd = typeOf(active) === 'std'
  const chip = 'rounded-full border border-[#cfc5b7] bg-white/80 text-[13px] text-[#3d332b] backdrop-blur-sm'

  return (
    <div ref={viewRef} className="relative mx-3 mt-3.5 h-[440px] shrink-0 overflow-hidden rounded-md md:mx-6 md:mt-4 md:h-[min(54vh,600px)] md:min-h-[360px] xl:mx-9 xl:mt-[18px]">
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" />
      <div className="pointer-events-none absolute inset-x-3 top-3 z-[2] flex flex-col items-stretch gap-2.5 md:flex-row md:items-start md:justify-between">
        {isStd ? (
          <div role="group" aria-label="空間規劃方案" className={`${chip} no-scrollbar pointer-events-auto flex max-w-full overflow-x-auto p-[3px]`}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={layout === p.id}
                onClick={() => setPreset(p.id)}
                className={`min-h-[34px] cursor-pointer rounded-full px-[13px] py-[7px] whitespace-nowrap ${layout === p.id ? 'bg-cocoa text-cream-ui' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <div className={`${chip} pointer-events-auto self-start px-3.5 py-2`}>{layout === 'hall' ? '講堂配置示意' : '書店咖啡配置示意'}</div>
        )}
        <button
          type="button"
          onClick={() => engineRef.current?.resetCamera()}
          className={`${chip} pointer-events-auto min-h-9 cursor-pointer self-end px-3.5 whitespace-nowrap md:self-auto`}
        >
          重設視角
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-2.5 left-3.5 text-xs text-ink-2">拖曳旋轉，滾輪或雙指縮放</div>
      <div
        ref={tipRef}
        className="pointer-events-none absolute z-[3] hidden translate-x-3 translate-y-3 rounded bg-cocoa px-2.5 py-1.5 text-xs whitespace-nowrap text-cream-ui"
      />
    </div>
  )
}
