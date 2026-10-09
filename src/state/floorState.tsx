import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { DEFAULT_FLOOR, layoutFor, typeOf } from '../data/floors'
import { PROJECT } from '../data/project'
import type { LayoutId, PresetId, Side } from '../data/types'

interface State {
  /** 點選鎖定的樓層 */
  locked: number
  /** 滑鼠預覽中的樓層 */
  preview: number | null
  /** 使用者在鎖定樓層手動切換的規劃 */
  override: PresetId | null
  /** 正在 hover 的戶（3D 與卡片同步） */
  hotUnit: Side | null
}

type Action =
  | { type: 'preview'; floor: number | null }
  | { type: 'lock'; floor: number }
  | { type: 'step'; delta: number }
  | { type: 'preset'; preset: PresetId }
  | { type: 'hot'; side: Side | null }

const clampFloor = (f: number) => Math.max(1, Math.min(PROJECT.totalFloors, f))

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'preview':
      return s.preview === a.floor ? s : { ...s, preview: a.floor }
    case 'lock':
      return { ...s, locked: a.floor, preview: null, override: a.floor === s.locked ? s.override : null }
    case 'step': {
      const f = clampFloor(s.locked + a.delta)
      return { ...s, locked: f, preview: null, override: f === s.locked ? s.override : null }
    }
    case 'preset':
      return { ...s, preview: null, override: a.preset }
    case 'hot':
      return s.hotUnit === a.side ? s : { ...s, hotUnit: a.side }
  }
}

interface FloorCtx extends State {
  active: number
  layout: LayoutId
  preview: number | null
  setPreview: (f: number | null) => void
  lock: (f: number) => void
  step: (d: number) => void
  setPreset: (p: PresetId) => void
  setHot: (s: Side | null) => void
}

const Ctx = createContext<FloorCtx | null>(null)

export function FloorProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, { locked: DEFAULT_FLOOR, preview: null, override: null, hotUnit: null })
  const value = useMemo<FloorCtx>(() => {
    const active = s.preview ?? s.locked
    const override = active === s.locked && typeOf(active) === 'std' ? s.override : null
    return {
      ...s,
      active,
      layout: layoutFor(active, override),
      setPreview: (floor) => dispatch({ type: 'preview', floor }),
      lock: (floor) => dispatch({ type: 'lock', floor }),
      step: (delta) => dispatch({ type: 'step', delta }),
      setPreset: (preset) => dispatch({ type: 'preset', preset }),
      setHot: (side) => dispatch({ type: 'hot', side }),
    }
  }, [s])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFloor() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFloor must be used inside <FloorProvider>')
  return v
}
