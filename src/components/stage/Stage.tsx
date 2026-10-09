import { PROJECT } from '../../data/project'
import { BrandHeader } from './BrandHeader'
import { Tower } from './Tower'

export function Stage() {
  return (
    <section aria-label="大樓樓層" className="dusk relative flex h-[800px] flex-col overflow-hidden text-on-umber md:h-auto md:min-h-0">
      <BrandHeader />
      <Tower />
      <div className="flex flex-wrap justify-between gap-x-[18px] gap-y-2 px-5 pt-2 pb-[18px] text-xs text-on-umber-2 md:px-8 md:pt-2.5 md:pb-[22px]">
        <div className="flex gap-[18px]">
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full border border-gold bg-gold" />招租中</span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full border border-dim" />Occupied</span>
        </div>
        <span>{PROJECT.footnote}</span>
      </div>
    </section>
  )
}
