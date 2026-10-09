import { freeCount, typeOf, unitsOf, zoneOf } from '../../data/floors'
import { FLOOR_TYPES } from '../../data/project'
import { useFloor } from '../../state/floorState'

export function FloorHeader() {
  const { active: f } = useFloor()
  const z = zoneOf(f), n = freeCount(f), total = unitsOf(f).length
  const avail = n === 0 ? '整層已出租' : n === total ? `${n} 戶皆可租` : `${n} 戶可租`
  return (
    <header className="grid grid-cols-[auto_1fr] items-end gap-x-[22px] border-b border-line px-5 pt-[22px] pb-3.5 md:grid-cols-[auto_1fr_auto] md:px-6 md:pt-6 md:pb-4 xl:px-9 xl:pt-[30px] xl:pb-[18px]">
      <div className="font-serif text-[64px] leading-[.82] font-black tracking-[-.01em] text-floor-num md:text-[76px]">
        {f}
        <small className="ml-0.5 text-[.42em] tracking-normal">F</small>
      </div>
      <div>
        <h2 className="font-serif text-[22px] font-semibold tracking-[.08em]">{z.name}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
          {z.desc}
          <br />
          {FLOOR_TYPES[typeOf(f)].desc}
        </p>
      </div>
      <div
        className={`col-span-full mt-3 justify-self-start rounded-full px-3 py-[7px] text-sm font-medium whitespace-nowrap md:col-auto md:mt-0 ${n === 0 ? 'bg-occ-bg text-occ' : 'bg-gold text-[#2a1d0c]'}`}
      >
        {avail}
      </div>
    </header>
  )
}
