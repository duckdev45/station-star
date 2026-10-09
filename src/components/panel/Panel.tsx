import { useState } from 'react'
import type { FloorStats } from '../../data/types'
import { FloorPlanView } from '../floorplan/FloorPlanView'
import { ContactFooter } from './ContactFooter'
import { FloorHeader } from './FloorHeader'
import { UnitCards } from './UnitCards'
import { ZoneLegend } from './ZoneLegend'

export function Panel() {
  const [stats, setStats] = useState<FloorStats | null>(null)
  return (
    <section aria-label="樓層空間規劃" className="flex flex-col bg-stone md:min-h-0 md:overflow-auto">
      <FloorHeader />
      <FloorPlanView onStats={setStats} />
      <ZoneLegend zones={stats?.zones ?? []} />
      <UnitCards plan={stats?.plan ?? {}} />
      <ContactFooter />
    </section>
  )
}
