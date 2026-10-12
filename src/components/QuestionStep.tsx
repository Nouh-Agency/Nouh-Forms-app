import type { Dispatch, SetStateAction } from 'react'
import type { BriefQuestion, BriefDisciplineConfig, ClientBasicInfo, BriefOption } from '../types/startProject.types'
import { ArrowRightIcon, CheckIcon, CircleCheckIcon, PlusIcon } from './Icons'

interface QuestionStepProps {
  question: BriefQuestion
  config: BriefDisciplineConfig
  answers: Record<string, string[]>
  clientInfo: ClientBasicInfo
  setClientInfo: Dispatch<SetStateAction<ClientBasicInfo>>
  toggleOption: (q: BriefQuestion, value: string) => void
  setHoveredOption: (opt: string | null) => void
  canContinue: boolean
  goNext: () => void
  isRTL?: boolean
}

export default function QuestionStep({
  question,
  config,
  answers,
  clientInfo,
  setClientInfo,
  toggleOption,
  setHoveredOption,
  canContinue,
  goNext,
  isRTL = false,
}: QuestionStepProps) {
  const mode = question.mode ?? 'list'

  let activeOptions: BriefOption[] = question.options ?? []
  if (question.parentQuestionId && question.optionsByParent) {
    const parentAnswer = (answers[question.parentQuestionId] ?? [])[0]
    if (parentAnswer && question.optionsByParent[parentAnswer]) {
      activeOptions = question.optionsByParent[parentAnswer]
    } else {
      const allParentKeys = Object.keys(question.optionsByParent)
      if (allParentKeys.length > 0) {
        activeOptions = question.optionsByParent[allParentKeys[0]]
      }
    }
  }

  return (
    <section className="flex-1 flex flex-col justify-between">
      <div className="grid grid-cols-1 lg:grid-cols-[.72fr_1.28fr] gap-10 lg:gap-[7vw] flex-1 items-start">
        <div className="lg:sticky lg:top-28">
          <div className="text-[#C5A059]/80 text-[10px] tracking-[0.58em] mb-5 font-light uppercase font-display">
            {isRTL ? question.eyebrowAr : question.eyebrow}
          </div>
          <h2
            className="text-white m-0 max-w-[620px] font-extrabold uppercase font-display"
            style={{ fontSize: 'clamp(24px,2.8vw,38px)', lineHeight: isRTL ? 1.25 : 1.1, letterSpacing: '-0.02em' }}
          >
            {isRTL ? question.titleAr : question.title}
          </h2>
          {(question.description || question.descriptionAr) && (
            <p className="text-white/40 mt-6 max-w-[420px] leading-[1.9] font-light text-[12px]">
              {isRTL ? question.descriptionAr : question.description}
            </p>
          )}
          {question.multi && (
            <div className="mt-7 text-white/20 text-[9px] tracking-[0.42em] uppercase font-display">
              {isRTL
                ? `تم اختيار ${answers[question.id]?.length ?? 0}${question.max ? ` من أصل ${question.max}` : ''}`
                : `${answers[question.id]?.length ?? 0} SELECTED${question.max ? ` / MAX ${question.max}` : ''}`}
            </div>
          )}
        </div>

        <div className="self-start w-full">
          {mode === 'basic_info' && (
            <div className="bg-[#0b0b0b]/60 border border-white/[0.08] p-6 sm:p-8 rounded-none">
              <label className="block mb-8">
                <span className="block text-white/70 text-[11px] tracking-[0.2em] mb-3 font-display">
                  {isRTL ? 'الاسم الكامل *' : 'FULL NAME *'}
                </span>
                <input
                  type="text"
                  required
                  placeholder={isRTL ? 'أدخل اسمك الكريم' : 'Enter client full name'}
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-[#C5A059] outline-none text-white pb-3 transition-colors placeholder:text-white/15 font-display text-[18px]"
                />
              </label>

              <label className="block mb-8">
                <span className="block text-white/70 text-[11px] tracking-[0.2em] mb-3 font-display">
                  {isRTL ? 'رقم الهاتف والتواصل *' : 'PHONE NUMBER *'}
                </span>
                <input
                  type="tel"
                  required
                  placeholder="+966 ..."
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-[#C5A059] outline-none text-white pb-3 transition-colors placeholder:text-white/15 font-display text-[18px]"
                />
              </label>

              <label className="block">
                <span className="block text-white/70 text-[11px] tracking-[0.2em] mb-3 font-display">
                  {isRTL ? 'العنوان / المدينة والموقع *' : 'ADDRESS / LOCATION *'}
                </span>
                <input
                  type="text"
                  required
                  placeholder={isRTL ? 'المدينة، الحي أو موقع الأرض' : 'City, neighborhood or plot location'}
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-[#C5A059] outline-none text-white pb-3 transition-colors placeholder:text-white/15 font-display text-[18px]"
                />
              </label>
            </div>
          )}

          {mode === 'image' && (
            <div className={`grid gap-3 ${question.columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {activeOptions.map((option, i) => {
                const active =
                  (answers[question.id] ?? []).includes(option.label) ||
                  (answers[question.id] ?? []).includes(option.labelAr)
                const optionValue = isRTL ? option.labelAr : option.label
                const isThreeColumns = question.columns === 3
                const isLastOdd = !isThreeColumns && activeOptions.length % 2 === 1 && i === activeOptions.length - 1
                return (
                  <button
                    key={option.label}
                    onClick={() => toggleOption(question, optionValue)}
                    onMouseEnter={() => setHoveredOption(option.label)}
                    onMouseLeave={() => setHoveredOption(null)}
                    className={`group relative overflow-hidden text-start bg-[#0a0a0a] border cursor-pointer ${isThreeColumns ? 'min-h-[190px] sm:min-h-[220px] lg:min-h-[240px]' : 'min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]'} transition-all ${isLastOdd ? 'sm:col-span-2' : ''}`}
                    style={{ borderColor: active ? 'rgba(197,160,89,.75)' : 'rgba(255,255,255,.08)' }}
                  >
                    {option.image && (
                      <img
                        src={option.image}
                        alt={option.label}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.035]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/95 via-[#080808]/45 to-[#080808]/15 group-hover:via-[#080808]/30 transition-colors duration-500" />
                    <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span className="text-white/40 text-[9px] tracking-[0.45em] font-display">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${active ? 'border-[#C5A059] bg-[#C5A059] text-[#080808]' : 'border-white/25 bg-[#080808]/30 text-white/45'}`}
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
                          style={{ fontSize: 'clamp(16px,1.6vw,20px)', lineHeight: 1.2 }}
                        >
                          {isRTL ? option.labelAr : option.label}
                        </div>
                        {(option.note || option.noteAr) && (
                          <div className="text-white/40 text-[10px] tracking-[0.2em] mt-2 font-light font-display">
                            {isRTL ? option.noteAr : option.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {mode === 'words' && (
            <div className="border-t border-white/[0.08]">
              {activeOptions.map((option, i) => {
                const active =
                  (answers[question.id] ?? []).includes(option.label) ||
                  (answers[question.id] ?? []).includes(option.labelAr)
                const optionValue = isRTL ? option.labelAr : option.label
                return (
                  <button
                    key={option.label}
                    onClick={() => toggleOption(question, optionValue)}
                    className="group w-full bg-transparent border-0 border-b border-white/[0.08] px-0 py-6 sm:py-7 lg:py-8 flex items-center justify-between gap-5 text-start cursor-pointer"
                  >
                    <div className="flex items-center gap-4 sm:gap-7">
                      <span className="text-white/25 text-[11px] tracking-[0.4em] font-display">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="transition-all duration-300 font-bold font-display"
                        style={{
                          fontSize: 'clamp(20px,2.2vw,30px)',
                          lineHeight: 1.3,
                          color: active ? 'white' : 'rgba(255,255,255,.45)',
                          transform: active
                            ? isRTL
                              ? 'translateX(-10px)'
                              : 'translateX(10px)'
                            : 'translateX(0)',
                        }}
                      >
                        {isRTL ? option.labelAr : option.label}
                      </span>
                    </div>
                    <span className="flex items-center justify-center w-6 h-6">
                      <CircleCheckIcon active={active} className="w-5 h-5" />
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {mode === 'list' && (
            <div className="border-t border-white/[0.08]">
              {activeOptions.map((option, i) => {
                const active =
                  (answers[question.id] ?? []).includes(option.label) ||
                  (answers[question.id] ?? []).includes(option.labelAr)
                const optionValue = isRTL ? option.labelAr : option.label
                return (
                  <button
                    key={option.label}
                    onClick={() => toggleOption(question, optionValue)}
                    className="group w-full bg-transparent border-0 border-b border-white/[0.08] px-0 py-6 sm:py-7 lg:py-8 flex items-center justify-between gap-6 text-start cursor-pointer"
                  >
                    <div className="flex items-center gap-5 sm:gap-7">
                      <span className="text-white/25 text-[11px] tracking-[0.4em] font-display">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="transition-colors duration-300 font-bold font-display"
                        style={{
                          fontSize: 'clamp(20px,2.2vw,30px)',
                          lineHeight: 1.3,
                          color: active ? 'white' : 'rgba(255,255,255,.45)',
                        }}
                      >
                        {isRTL ? option.labelAr : option.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`h-px transition-all duration-300 ${active ? 'bg-[#C5A059]' : 'bg-white/[0.16]'}`}
                        style={{ width: active ? 48 : 24 }}
                      />
                      {active && <CheckIcon className="w-4 h-4 text-[#C5A059]" />}
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
          {isRTL ? config.shortLabelAr : config.shortLabel} / {isRTL ? 'خطوة هرمية' : 'STEP'}
        </div>
        <button
          disabled={!canContinue}
          onClick={goNext}
          className={`${isRTL ? 'mr-auto' : 'ml-auto'} inline-flex items-center gap-5 bg-transparent border-0 p-0`}
          style={{ cursor: canContinue ? 'pointer' : 'not-allowed' }}
        >
          <span
            className={`text-[10px] tracking-[0.46em] font-light uppercase font-display ${canContinue ? 'text-white' : 'text-white/20'}`}
          >
            {isRTL ? 'متابعة' : 'CONTINUE'}
          </span>
          <span
            className={`h-px transition-all duration-300 ${canContinue ? 'bg-[#C5A059]' : 'bg-white/10'}`}
            style={{ width: canContinue ? 56 : 24 }}
          />
          <ArrowRightIcon
            className={`w-3.5 h-3.5 ${canContinue ? 'text-[#C5A059]' : 'text-white/15'} ${isRTL ? 'scale-x-[-1]' : ''}`}
          />
        </button>
      </div>
    </section>
  )
}
