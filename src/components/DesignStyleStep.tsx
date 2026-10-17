import type { BriefQuestion, BriefOption } from '../types/startProject.types'
import type { DesignStyle } from '../types/designStyle.types'
import { useDesignStylesQuery } from '../queries/useDesignStylesQuery'
import { CheckIcon, PlusIcon } from './Icons'

interface DesignStyleStepProps {
  question: BriefQuestion
  selectedOptions: string[]
  onToggleOption: (optionValue: string, style: DesignStyle | null) => void
  onHoverImage: (imageUrl: string | null) => void
  isRTL?: boolean
  shortLabel?: string
  shortLabelAr?: string
}

export default function DesignStyleStep({
  question,
  selectedOptions,
  onToggleOption,
  onHoverImage,
  isRTL = false,
  shortLabel,
  shortLabelAr,
}: DesignStyleStepProps) {
  const { data: apiDesignStyles, isLoading } = useDesignStylesQuery()

  const activeStyles = (apiDesignStyles ?? [])
    .filter((s) => s.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order)

  const fallbackOptions: BriefOption[] = question.options ?? []

  const displayItems =
    activeStyles.length > 0
      ? activeStyles.map((s) => ({
        id: s.id,
        label: s.name,
        labelAr: s.name,
        note: s.description,
        noteAr: s.description,
        image: s.image,
        styleRef: s,
      }))
      : fallbackOptions.map((opt, idx) => ({
        id: idx + 1,
        label: opt.label,
        labelAr: opt.labelAr,
        note: opt.note,
        noteAr: opt.noteAr,
        image: opt.image,
        styleRef: null,
      }))

  return (
    <section className="flex-1 flex flex-col justify-between w-full">
      <div className="w-full flex-1 flex flex-col items-start">
        <div className="w-full mb-8 lg:mb-10">
          <div className="text-[#C5A059]/80 text-[10px] tracking-[0.58em] mb-4 font-light uppercase font-display">
            {isRTL ? question.eyebrowAr : question.eyebrow}
          </div>
          <h2
            className="text-white m-0 max-w-[800px] font-extrabold uppercase font-display"
            style={{
              fontSize: 'clamp(24px,2.8vw,38px)',
              lineHeight: isRTL ? 1.25 : 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {isRTL ? question.titleAr : question.title}
          </h2>
          {(question.description || question.descriptionAr) && (
            <p className="text-white/40 mt-4 max-w-[700px] leading-[1.9] font-light text-[12px]">
              {isRTL ? question.descriptionAr : question.description}
            </p>
          )}
          {question.multi && (
            <div className="mt-5 text-white/20 text-[9px] tracking-[0.42em] uppercase font-display">
              {isRTL
                ? `تم اختيار ${selectedOptions.length}${question.max ? ` من أصل ${question.max}` : ''}`
                : `${selectedOptions.length} SELECTED${question.max ? ` / MAX ${question.max}` : ''}`}
            </div>
          )}
        </div>

        <div className="w-full">
          {isLoading && activeStyles.length === 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="animate-pulse bg-[#0a0a0a] border border-white/[0.08] min-h-[190px] p-5 flex flex-col justify-between"
                >
                  <div className="w-8 h-4 bg-white/10" />
                  <div className="space-y-2">
                    <div className="w-3/4 h-4 bg-white/15" />
                    <div className="w-1/2 h-3 bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {displayItems.map((item, i) => {
                const optionValue = isRTL ? item.labelAr : item.label
                const active =
                  selectedOptions.includes(item.label) || selectedOptions.includes(item.labelAr)

                return (
                  <button
                    key={item.label}
                    onClick={() => onToggleOption(optionValue, item.styleRef)}
                    onMouseEnter={() => onHoverImage(item.image ?? null)}
                    onMouseLeave={() => onHoverImage(null)}
                    className="group relative overflow-hidden text-start bg-[#0a0a0a] border cursor-pointer min-h-[190px] sm:min-h-[220px] lg:min-h-[240px] transition-all"
                    style={{
                      borderColor: active ? 'rgba(197,160,89,.75)' : 'rgba(255,255,255,.08)',
                    }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.label}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.035]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/95 via-[#080808]/45 to-[#080808]/15 group-hover:via-[#080808]/30 transition-colors duration-500" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span className="text-white/40 text-[9px] tracking-[0.45em] font-display">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${active
                              ? 'border-[#C5A059] bg-[#C5A059] text-[#080808]'
                              : 'border-white/25 bg-[#080808]/30 text-white/45'
                            }`}
                        >
                          {active ? (
                            <CheckIcon className="w-3.5 h-3.5" />
                          ) : (
                            <PlusIcon className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </div>
                      <div>
                        <div
                          className="text-white font-bold font-display"
                          style={{ fontSize: 'clamp(15px,1.5vw,19px)', lineHeight: 1.2 }}
                        >
                          {isRTL ? item.labelAr : item.label}
                        </div>
                        {(item.note || item.noteAr) && (
                          <div className="text-white/40 text-[10px] tracking-[0.2em] mt-2 font-light font-display">
                            {isRTL ? item.noteAr : item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 mt-10 pt-6 border-t border-white/[0.06]">
        <div className="text-white/20 text-[9px] tracking-[0.4em] hidden sm:block uppercase font-display">
          {isRTL ? shortLabelAr : shortLabel} / {isRTL ? 'أنماط التصميم' : 'DESIGN STYLES'}
        </div>
      </div>
    </section>
  )
}
