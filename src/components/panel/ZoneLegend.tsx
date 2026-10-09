import type { ZonePin } from '../../data/types'

/** 3D 圖上 ①②③ 的圖例 */
export function ZoneLegend({ zones }: { zones: ZonePin[] }) {
  return (
    <ol aria-label="空間配置" className="flex flex-wrap gap-x-5 gap-y-2 px-5 pt-3 text-sm md:px-6 xl:px-9 xl:pt-3.5">
      {zones.map((z, i) => (
        <li key={z.name} className="flex items-center gap-2">
          <span className="grid size-[22px] flex-none place-items-center rounded-full bg-chip text-xs font-bold text-on-chip">{i + 1}</span>
          {z.name}
          {z.sub && <small className="text-[13px] text-ink-2">{z.sub}</small>}
        </li>
      ))}
    </ol>
  )
}
