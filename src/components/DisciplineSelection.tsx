import { useEffect, useState } from 'react'
import type { BriefDiscipline } from '../types/startProject.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import { ArrowUpRightIcon } from './Icons'

interface DisciplineSelectionProps {
  onChooseDiscipline: (id: BriefDiscipline) => void
  isRTL?: boolean
}

export default function DisciplineSelection({
  onChooseDiscipline,
  isRTL = false,
}: DisciplineSelectionProps) {
  const [hoveredDiscipline, setHoveredDiscipline] = useState<BriefDiscipline>('architecture')
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const activeDiscipline =
    PROJECT_BRIEF_DISCIPLINES.find((item) => item.id === hoveredDiscipline) ??
    PROJECT_BRIEF_DISCIPLINES[0]

  return (
    <main className="relative min-h-[100svh] bg-[#080808] text-white overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black, transparent 92%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 92%)',
        }}
      />
      <div
        className={`absolute top-0 bottom-0 ${isRTL ? 'left-[5vw]' : 'right-[5vw]'} w-px bg-white/[0.035] pointer-events-none`}
      />

      <section className="relative z-10 min-h-[100svh] px-[5vw] pt-24 sm:pt-28 pb-10 flex flex-col justify-between">
        <div
          className="mb-8 pb-6 border-b border-white/[0.08]"
          style={{ opacity: revealed ? 1 : 0, transition: 'opacity .7s ease' }}
        >
          <div className="text-[#C5A059]/80 font-normal text-[10px] tracking-[0.45em] mb-2 uppercase font-display whitespace-nowrap">
            {isRTL ? 'نوح للحلول المعمارية والتقنية' : 'NOUH AGENCY / FORMS'}
          </div>
          <h1
            className="m-0 text-white font-semibold font-display whitespace-nowrap leading-none"
            style={{ fontSize: 'clamp(28px,3.4vw,50px)', letterSpacing: '-0.01em' }}
          >
            {isRTL ? 'اختر القسم ونوع العمل.' : 'CHOOSE A DISCIPLINE.'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_36%] border-t border-white/[0.08] flex-1 min-h-[460px]">
          <div className={`border-r-0 ${isRTL ? 'lg:border-l' : 'lg:border-r'} border-white/[0.08]`}>
            {PROJECT_BRIEF_DISCIPLINES.map((item, i) => {
              const active = hoveredDiscipline === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onChooseDiscipline(item.id)}
                  onMouseEnter={() => setHoveredDiscipline(item.id)}
                  className="group w-full bg-transparent border-0 border-b border-white/[0.08] px-0 py-7 sm:py-9 text-start cursor-pointer block transition-colors"
                  style={{
                    opacity: revealed ? 1 : 0,
                    transform: `translateY(${revealed ? 0 : 10}px)`,
                    transition: `opacity .6s ease ${120 + i * 90}ms, transform .6s ease ${120 + i * 90}ms`,
                  }}
                >
                  <div className="grid grid-cols-[42px_1fr_auto] sm:grid-cols-[56px_1fr_auto] gap-4 sm:gap-6 items-center">
                    <span
                      className={`text-[9px] tracking-[0.42em] font-display ${active ? 'text-[#C5A059]' : 'text-white/20'}`}
                    >
                      {item.num}
                    </span>
                    <div>
                      <div
                        className="transition-colors duration-300 font-semibold font-display"
                        style={{
                          fontSize: 'clamp(22px,2.6vw,38px)',
                          lineHeight: 1.1,
                          letterSpacing: '-.01em',
                          color: active ? 'white' : 'rgba(255,255,255,.42)',
                        }}
                      >
                        {isRTL ? item.labelAr : item.label}
                      </div>
                      <div className="mt-2 text-[10px] tracking-[0.2em] text-white/25 font-light font-display">
                        {isRTL ? item.subtitleAr : item.subtitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`hidden sm:block h-px transition-all duration-300 ${active ? 'bg-[#C5A059]' : 'bg-white/[0.12]'}`}
                        style={{ width: active ? 48 : 22 }}
                      />
                      <ArrowUpRightIcon
                        className={`w-3.5 h-3.5 transition-colors ${active ? 'text-[#C5A059]' : 'text-white/20'} ${isRTL ? 'scale-x-[-1]' : ''}`}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="relative hidden lg:block overflow-hidden bg-[#0b0b0b]">
            {PROJECT_BRIEF_DISCIPLINES.map((item) => (
              <img
                key={item.id}
                src={item.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: activeDiscipline.id === item.id ? 0.72 : 0,
                  transform: activeDiscipline.id === item.id ? 'scale(1.01)' : 'scale(1.05)',
                  transition: 'opacity .55s ease, transform 1s ease',
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/85 via-transparent to-[#080808]/25" />
            <div className="absolute left-6 right-6 bottom-6 border-t border-white/15 pt-4">
              <div className="text-[#D4B06A] text-[9px] tracking-[0.42em] mb-2 font-display">
                {isRTL ? activeDiscipline.shortLabelAr : activeDiscipline.label}
              </div>
              <p className="text-white/60 text-[11px] leading-[1.7] m-0 font-light font-display">
                {isRTL ? activeDiscipline.subtitleAr : activeDiscipline.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
