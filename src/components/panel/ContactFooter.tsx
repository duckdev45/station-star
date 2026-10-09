import markCream from '../../assets/brand/fumao-mark-cream.webp'
import markTaupe from '../../assets/brand/fumao-mark-taupe.webp'
import { PROJECT } from '../../data/project'

export function ContactFooter() {
  const { contact } = PROJECT
  return (
    <footer className="mx-5 mt-5 mb-[26px] grid gap-x-6 gap-y-1.5 border-t border-line pt-4 text-sm leading-relaxed md:mx-6 md:mb-7 md:grid-cols-[auto_1fr] xl:mx-9 xl:mt-[22px] xl:mb-[30px]">
      <span>租賃詳洽</span>
      <span>
        <a href={contact.tel} className="font-bold decoration-gold underline-offset-[3px]">{contact.label}</a>　{contact.person}
      </span>
      <span>基地位置</span>
      <span>{PROJECT.location}</span>
      <span className="col-span-full mt-1.5 flex items-center gap-2.5 text-xs tracking-[.3em] text-ink-2">
        <img src={markTaupe} alt="" className="mark-light h-[26px] w-auto" />
        <img src={markCream} alt="" className="mark-dark h-[26px] w-auto" />
        {PROJECT.developer}
      </span>
      <span className="col-span-full text-xs text-ink-2">{PROJECT.disclaimer}</span>
    </footer>
  )
}
