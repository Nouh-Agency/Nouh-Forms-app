import { useState } from 'react'
import type { BriefDiscipline, BriefQuestion, ClientBasicInfo } from '../types/startProject.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import DisciplineSelection from '../components/DisciplineSelection'
import NavigationActions from '../components/NavigationActions'
import QuestionStep from '../components/QuestionStep'
import SummaryStep from '../components/SummaryStep'

interface StartProjectPageProps {
  onNavigateHome?: () => void
  initialRTL?: boolean
}

export function StartProjectPage({ onNavigateHome, initialRTL = true }: StartProjectPageProps) {
  const [isRTL, setIsRTL] = useState(initialRTL)
  const [discipline, setDiscipline] = useState<BriefDiscipline | null>(null)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [clientInfo, setClientInfo] = useState<ClientBasicInfo>({
    name: '',
    phone: '',
    address: '',
    note: '',
  })

  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === discipline)
  const question = config?.questions[step]
  const isSummary = !!config && step >= config.questions.length
  const totalSteps = config?.questions.length ?? 0
  const progress = !config ? 0 : isSummary ? 1 : (step + 1) / (totalSteps + 1)

  const chooseDiscipline = (id: BriefDiscipline) => {
    setDiscipline(id)
    setStep(0)
    setAnswers({})
    setHoveredOption(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleOption = (q: BriefQuestion, value: string) => {
    const current = answers[q.id] ?? []
    if (!q.multi) {
      setAnswers((prev) => ({ ...prev, [q.id]: [value] }))
      return
    }
    if (current.includes(value)) {
      setAnswers((prev) => ({ ...prev, [q.id]: current.filter((v) => v !== value) }))
      return
    }
    if (q.max && current.length >= q.max) return
    setAnswers((prev) => ({ ...prev, [q.id]: [...current, value] }))
  }

  const canContinue = !question
    ? false
    : question.mode === 'basic_info'
      ? Boolean(clientInfo.name.trim() && clientInfo.phone.trim() && clientInfo.address.trim())
      : (answers[question.id]?.length ?? 0) > 0

  const goBack = () => {
    setHoveredOption(null)
    if (!config) {
      if (onNavigateHome) onNavigateHome()
      return
    }
    if (step === 0) {
      setDiscipline(null)
      setAnswers({})
      return
    }
    setStep((s) => s - 1)
  }

  const goNext = () => {
    if (!config || !question || !canContinue) return
    setHoveredOption(null)
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitBrief = () => {
    if (!config || !clientInfo.name) return

    const summaryLines = config.questions
      .filter((q) => q.mode !== 'basic_info')
      .map((q) => `${isRTL ? q.titleAr : q.title}:\n${(answers[q.id] ?? []).join(', ') || '—'}`)
      .join('\n\n')

    const body = [
      `ملف العميل: ${clientInfo.name}`,
      `القسم: ${isRTL ? config.labelAr : config.label}`,
      `رقم الهاتف: ${clientInfo.phone}`,
      `العنوان: ${clientInfo.address}`,
      '',
      '--- تفاصيل الاستبيان الهرمي ---',
      summaryLines,
      '',
      '--- ملاحظات إضافية ---',
      clientInfo.note || '—',
    ].join('\n')

    window.location.href = `mailto:hello@nouh-agency.com?subject=${encodeURIComponent(
      `ملف العميل: ${clientInfo.name} — ${isRTL ? config.labelAr : config.label}`
    )}&body=${encodeURIComponent(body)}`
  }

  const mode = question?.mode ?? 'list'
  const activeOptions = question?.options ?? (
    question?.parentQuestionId && question?.optionsByParent
      ? question.optionsByParent[(answers[question.parentQuestionId] ?? [])[0]] ??
        Object.values(question.optionsByParent)[0] ?? []
      : []
  )
  const hoveredImage = activeOptions.find(
    (option) => option.label === hoveredOption || option.labelAr === hoveredOption
  )?.image

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#080808] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 px-[5vw] py-5 flex items-center justify-between pointer-events-none whitespace-nowrap">
        <div className="pointer-events-auto flex items-center gap-3 whitespace-nowrap">
          <span className="text-[10px] sm:text-[11px] tracking-[0.45em] text-[#C5A059] font-medium font-display uppercase whitespace-nowrap">
            NOUH AGENCY
          </span>
          <span className="hidden sm:inline text-[9px] tracking-[0.2em] text-white/35 font-display whitespace-nowrap">
            {isRTL ? 'نظام استبيان المشاريع الهرمي' : 'FORMS & BRIEFS'}
          </span>
        </div>
        <div className="pointer-events-auto flex items-center gap-4 whitespace-nowrap">
          <button
            onClick={() => setIsRTL((prev) => !prev)}
            className="px-3 py-1 border border-white/10 hover:border-[#C5A059] text-[9px] tracking-[0.25em] bg-[#080808]/60 backdrop-blur-md rounded-full text-white/60 hover:text-white transition-all cursor-pointer font-display whitespace-nowrap"
          >
            {isRTL ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      {!config ? (
        <DisciplineSelection
          onChooseDiscipline={chooseDiscipline}
          isRTL={isRTL}
        />
      ) : (
        <main className="relative min-h-[100svh] bg-[#080808] text-white overflow-hidden">
          {!isSummary && mode === 'image' && hoveredImage && (
            <div className="fixed inset-0 pointer-events-none z-0">
              <img
                src={hoveredImage}
                alt=""
                className="w-full h-full object-cover opacity-[0.14] scale-[1.03] transition-all duration-700"
              />
              <div className="absolute inset-0 bg-[#080808]/75" />
            </div>
          )}

          <div className="relative z-10 px-[5vw] pt-24 sm:pt-28 pb-10 min-h-[100svh] flex flex-col justify-between">
            <NavigationActions
              isSummary={isSummary}
              canContinue={canContinue}
              config={config}
              step={step}
              totalSteps={totalSteps}
              progress={progress}
              goBack={goBack}
              goNext={goNext}
              isRTL={isRTL}
            />

            {!isSummary && question && (
              <QuestionStep
                question={question}
                config={config}
                answers={answers}
                clientInfo={clientInfo}
                setClientInfo={setClientInfo}
                toggleOption={toggleOption}
                setHoveredOption={setHoveredOption}
                canContinue={canContinue}
                goNext={goNext}
                isRTL={isRTL}
              />
            )}

            {isSummary && (
              <SummaryStep
                config={config}
                answers={answers}
                clientInfo={clientInfo}
                setClientInfo={setClientInfo}
                submitBrief={submitBrief}
                isRTL={isRTL}
              />
            )}
          </div>
        </main>
      )}
    </div>
  )
}

export default StartProjectPage
