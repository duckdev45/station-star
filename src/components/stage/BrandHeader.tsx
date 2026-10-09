import { useMemo } from 'react'
import markCream from '../../assets/brand/fumao-mark-cream.webp'
import { tally } from '../../data/floors'
import { PROJECT } from '../../data/project'

export function BrandHeader() {
  const { free, occ } = useMemo(tally, [])
  return (
    <div className="relative z-[2] flex items-start justify-between gap-4 px-5 pt-[22px] md:px-8 md:pt-7">
      <div>
        <div className="mb-3 flex items-center gap-2.5 text-xs tracking-[.32em] text-on-umber-2">
          <img src={markCream} alt="" className="h-[22px] w-auto opacity-90" />
          {PROJECT.developer}
        </div>
        <h1 className="font-serif text-[clamp(28px,2.5vw,38px)] leading-[1.1] font-black tracking-[.06em] text-gold-soft">
          {PROJECT.name}
        </h1>
        <p className="mt-3.5 font-serif text-lg leading-[1.75] font-semibold tracking-[.1em] text-on-umber">
          {PROJECT.slogan[0]}
          <br />
          {PROJECT.slogan[1]}
        </p>
      </div>
      <div className="text-right text-[13px] leading-normal whitespace-nowrap text-on-umber-2">
        <b className="block font-serif text-[30px] leading-[1.1] font-black text-gold">{free}</b>
        戶可租
        <br />
        已出租 {occ} 戶
      </div>
    </div>
  )
}
