import { useEffect, useState } from 'react'
import type { BriefDiscipline } from '../types/startProject.types'
import type { Department } from '../types/department.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import { useDepartmentsQuery } from '../queries/useDepartmentsQuery'
import { ArrowUpRightIcon } from './Icons'

const DEPARTMENT_DISCIPLINE_MAP: Record<number, BriefDiscipline> = {
  1: 'architecture',
  2: 'graphic',
  3: 'technology',
}

interface DisciplineSelectionProps {
  onChooseDiscipline: (id: BriefDiscipline) => void
  isRTL?: boolean
}

export default function DisciplineSelection({
  onChooseDiscipline,
  isRTL = false,
}: DisciplineSelectionProps) {
  const { data: apiDepartments, isLoading } = useDepartmentsQuery()
  const [hoveredDepartmentId, setHoveredDepartmentId] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const activeList: Department[] =
    apiDepartments && apiDepartments.length > 0
      ? [...apiDepartments]
          .filter((d) => d.is_active !== false)
          .sort((a, b) => a.sort_order - b.sort_order)
      : []

  const fallbackList: Department[] = PROJECT_BRIEF_DISCIPLINES.map((d, index) => ({
    id: index + 1,
    name: isRTL ? d.labelAr : d.label,
    description: isRTL ? d.subtitleAr : d.subtitle,
    image: d.image,
    is_active: true,
    sort_order: index,
  }))

  const departments: Department[] = activeList.length > 0 ? activeList : fallbackList

  const activeDepartment =
    departments.find((d) => d.id === hoveredDepartmentId) ?? departments[0]

  const handleSelectDepartment = (dept: Department) => {
    const disciplineId = DEPARTMENT_DISCIPLINE_MAP[dept.id] ?? 'architecture'
    onChooseDiscipline(disciplineId)
  }

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
            <div className="lg:hidden flex flex-col gap-4 py-6">
              {isLoading && activeList.length === 0 ? (
                [1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="animate-pulse bg-[#0a0a0a] border border-white/[0.08] min-h-[200px] p-5 flex flex-col justify-between"
                  >
                    <div className="w-8 h-4 bg-white/10" />
                    <div className="space-y-3">
                      <div className="w-3/4 h-5 bg-white/15" />
                      <div className="w-1/2 h-3 bg-white/5" />
                    </div>
                  </div>
                ))
              ) : (
                departments.map((item, i) => {
                  const numString = String(i + 1).padStart(2, '0')
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectDepartment(item)}
                      className="group relative overflow-hidden text-start bg-[#0a0a0a] border border-white/[0.08] active:border-[#C5A059] cursor-pointer min-h-[220px] w-full p-5 sm:p-6 flex flex-col justify-between transition-all"
                      style={{
                        opacity: revealed ? 1 : 0,
                        transform: `translateY(${revealed ? 0 : 10}px)`,
                        transition: `opacity .6s ease ${120 + i * 90}ms, transform .6s ease ${120 + i * 90}ms`,
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/95 via-[#080808]/50 to-[#080808]/20" />
                      <div className="relative z-10 flex items-start justify-between">
                        <span className="text-white/40 text-[9px] tracking-[0.45em] font-display">
                          {numString}
                        </span>
                        <div className="w-7 h-7 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60">
                          <ArrowUpRightIcon className={`w-3.5 h-3.5 text-[#C5A059] ${isRTL ? 'scale-x-[-1]' : ''}`} />
                        </div>
                      </div>
                      <div className="relative z-10">
                        <div className="text-white font-bold font-display text-[20px] sm:text-[22px] leading-tight">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-white/50 text-[10px] sm:text-[11px] tracking-wide mt-2 font-light font-display leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <div className="hidden lg:block">
              {isLoading && activeList.length === 0 ? (
                <div className="py-8 flex flex-col gap-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="animate-pulse flex items-center gap-6 py-8 border-b border-white/[0.08]"
                    >
                      <div className="w-8 h-4 bg-white/10 rounded-sm" />
                      <div className="flex-1 space-y-3">
                        <div className="w-56 h-6 bg-white/15 rounded-sm" />
                        <div className="w-80 h-3 bg-white/5 rounded-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                departments.map((item, i) => {
                  const active = activeDepartment?.id === item.id
                  const numString = String(i + 1).padStart(2, '0')
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectDepartment(item)}
                      onMouseEnter={() => setHoveredDepartmentId(item.id)}
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
                          {numString}
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
                            {item.name}
                          </div>
                          <div className="mt-2 text-[10px] tracking-[0.2em] text-white/25 font-light font-display">
                            {item.description}
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
                })
              )}
            </div>
          </div>

          <div className="relative hidden lg:block overflow-hidden bg-[#0b0b0b]">
            {departments.map((item) => (
              <img
                key={item.id}
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: activeDepartment?.id === item.id ? 0.72 : 0,
                  transform: activeDepartment?.id === item.id ? 'scale(1.01)' : 'scale(1.05)',
                  transition: 'opacity .55s ease, transform 1s ease',
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/85 via-transparent to-[#080808]/25" />
            {activeDepartment && (
              <div className="absolute left-6 right-6 bottom-6 border-t border-white/15 pt-4">
                <div className="text-[#D4B06A] text-[9px] tracking-[0.42em] mb-2 font-display">
                  {activeDepartment.name}
                </div>
                <p className="text-white/60 text-[11px] leading-[1.7] m-0 font-light font-display">
                  {activeDepartment.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

