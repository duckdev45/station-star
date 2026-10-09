import { unitsOf } from '../../data/floors'
import { PROJECT } from '../../data/project'
import type { FloorStats } from '../../data/types'
import { useFloor } from '../../state/floorState'

export function UnitCards({ plan }: { plan: FloorStats['plan'] }) {
  const { active, hotUnit, setHot } = useFloor()
  return (
    <div className="grid gap-3.5 px-3 pt-3 md:grid-cols-2 md:px-6 md:pt-3.5 xl:px-9 xl:pt-4" onPointerLeave={() => setHot(null)}>
      {unitsOf(active).map((u) => {
        const hot = hotUnit === u.side
        return (
          <article
            key={u.id}
            onPointerEnter={() => setHot(u.side)}
            className={`flex flex-col gap-2 rounded-md border bg-paper px-[18px] pt-4 pb-[18px] transition-[border-color,box-shadow] ${hot ? 'border-gold shadow-[0_0_0_1px_var(--color-gold)]' : 'border-line'}`}
          >
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h3 className={`font-serif text-2xl font-black ${u.occ ? 'text-occ' : ''}`}>{u.id}</h3>
              <span className={`text-[15px] font-medium ${u.occ ? 'text-occ' : ''}`}>{u.area} 坪</span>
              <span className={`ml-auto rounded-full px-2.5 py-[3px] text-[13px] font-medium ${u.occ ? 'bg-occ-bg text-occ' : 'bg-gold text-[#2a1d0c]'}`}>
                {u.occ ? 'Occupied' : '招租中'}
              </span>
            </div>
            <p className="text-sm leading-[1.65]">{u.occ ? '此戶已出租。' : (plan[u.side] ?? '')}</p>
            <p className="text-[13px] leading-relaxed text-ink-2">{u.note}</p>
            {!u.occ && (
              <a
                href={PROJECT.contact.tel}
                className="mt-auto inline-flex min-h-10 items-center self-start rounded-full bg-maroon px-4 text-sm font-medium text-[#f6eee2] no-underline hover:bg-maroon-hover"
              >
                預約看屋
              </a>
            )}
          </article>
        )
      })}
    </div>
  )
}
