import { useState, useEffect } from 'react'
import type { BriefDiscipline, BriefQuestion, ClientBasicInfo } from '../types/startProject.types'
import type { ProjectCategory } from '../types/projectCategory.types'
import type { ProjectType } from '../types/projectType.types'
import type { DesignStyle } from '../types/designStyle.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import DisciplineSelection from '../components/DisciplineSelection'
import NavigationActions from '../components/NavigationActions'
import BasicInfoStep from '../components/BasicInfoStep'
import CategoryStep from '../components/CategoryStep'
import ProjectTypeStep from '../components/ProjectTypeStep'
import DesignStyleStep from '../components/DesignStyleStep'
import QuestionStep from '../components/QuestionStep'
import SummaryStep from '../components/SummaryStep'
import QuestionnaireStep from '../components/QuestionnaireStep'
import { useCreateClientMutation } from '../queries/useCreateClientMutation'
import { useCreateProjectMutation } from '../queries/useCreateProjectMutation'
import { fetchProjectQuestionnaire } from '../api/questionnaireApi'
import { useSubmitQuestionnaireAnswersMutation } from '../queries/useSubmitQuestionnaireAnswersMutation'
import type { CreateProjectPayload } from '../types/project.types'
import type {
  QuestionnaireQuestion,
  QuestionnaireAnswerValue,
} from '../types/questionnaire.types'

interface StartProjectPageProps {
  onNavigateHome?: () => void
  initialRTL?: boolean
}

export function StartProjectPage({ onNavigateHome }: StartProjectPageProps) {
  const isRTL = true
  const [discipline, setDiscipline] = useState<BriefDiscipline | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [createdClientId, setCreatedClientId] = useState<number | null>(null)
  const [questionnaireQuestions, setQuestionnaireQuestions] = useState<QuestionnaireQuestion[]>([])
  const [isQuestionnaireActive, setIsQuestionnaireActive] = useState(false)
  const [savedProject, setSavedProject] = useState<{ id: number; name: string } | null>(null)
  const [clientInfo, setClientInfo] = useState<ClientBasicInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
  })
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(null)
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null)
  const [selectedDesignStyle, setSelectedDesignStyle] = useState<DesignStyle | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const createClientMutation = useCreateClientMutation()
  const createProjectMutation = useCreateProjectMutation()
  const submitAnswersMutation = useSubmitQuestionnaireAnswersMutation()

  const selectedDepartmentId =
    discipline === 'architecture' ? 1 : discipline === 'graphic' ? 2 : discipline === 'technology' ? 3 : 1

  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === discipline)
  const question = config?.questions[step]
  const isSummary = !!config && step >= config.questions.length
  const totalSteps = config?.questions.length ?? 0
  const progress = !config ? 0 : isSummary ? 1 : (step + 1) / (totalSteps + 1)

  const chooseDiscipline = (id: BriefDiscipline) => {
    setDiscipline(id)
    setStep(0)
    setAnswers({})
    setSelectedCategory(null)
    setSelectedProjectType(null)
    setSelectedDesignStyle(null)
    setHoveredImage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectCategory = (value: string, cat: ProjectCategory | null) => {
    setSelectedCategory(cat)
    setAnswers((prev) => ({ ...prev, [question?.id ?? 'projectType']: [value] }))
  }

  const handleSelectProjectType = (value: string, pt: ProjectType | null) => {
    setSelectedProjectType(pt)
    setAnswers((prev) => ({ ...prev, [question?.id ?? 'subType']: [value] }))
  }

  const handleToggleDesignStyle = (value: string, style: DesignStyle | null) => {
    const questionId = question?.id ?? 'style'
    const current = answers[questionId] ?? []
    if (current.includes(value)) {
      setAnswers((prev) => ({ ...prev, [questionId]: current.filter((v) => v !== value) }))
      if (selectedDesignStyle?.name === value) {
        setSelectedDesignStyle(null)
      }
    } else {
      if (question?.max && current.length >= question.max) return
      setAnswers((prev) => ({ ...prev, [questionId]: [...current, value] }))
      setSelectedDesignStyle(style)
    }
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
      ? Boolean(
          clientInfo.name.trim() &&
          clientInfo.phone.trim() &&
          (clientInfo.email ?? '').trim() &&
          clientInfo.address.trim()
        )
      : (answers[question.id]?.length ?? 0) > 0

  const goBack = () => {
    setHoveredImage(null)
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
    if (!config || !question || !canContinue || createClientMutation.isPending) return
    if (question.mode === 'basic_info') {
      createClientMutation.mutate(
        {
          name: clientInfo.name.trim(),
          phone: clientInfo.phone.trim(),
          email: (clientInfo.email ?? '').trim(),
          address: clientInfo.address.trim(),
        },
        {
          onSuccess: (client) => {
            setCreatedClientId(client.id)
            setHoveredImage(null)
            setStep((s) => s + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          },
        }
      )
      return
    }
    setHoveredImage(null)
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveProject = async () => {
    let clientId = createdClientId
    if (!clientId && clientInfo.name.trim()) {
      const client = await createClientMutation.mutateAsync({
        name: clientInfo.name.trim(),
        phone: clientInfo.phone.trim(),
        email: (clientInfo.email ?? '').trim(),
        address: clientInfo.address.trim(),
      })
      clientId = client.id
      setCreatedClientId(client.id)
    }

    const subTypeName = answers['subType']?.[0]
    const projectName = subTypeName
      ? (subTypeName.startsWith('مشروع') ? subTypeName : `مشروع ${subTypeName}`)
      : clientInfo.name
        ? `مشروع ${clientInfo.name}`
        : 'مشروع جديد'

    const payload: CreateProjectPayload = {
      client_id: clientId ?? 1,
      department_id: selectedDepartmentId,
      project_category_id: selectedCategory?.id ?? 1,
      project_type_id: selectedProjectType?.id ?? 1,
      design_style_id: selectedDesignStyle?.id ?? 1,
      project_name: projectName,
      notes: clientInfo.note.trim() || 'ملاحظات المشروع',
    }

    const createdProject = await createProjectMutation.mutateAsync(payload)
    const questions = await fetchProjectQuestionnaire(createdProject.id)
    setQuestionnaireQuestions(questions)
    setSavedProject({ id: createdProject.id, name: createdProject.project_name })
    setIsQuestionnaireActive(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackFromQuestionnaire = () => {
    setIsQuestionnaireActive(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitQuestionnaireAnswers = async (
    formattedAnswers: Record<string, QuestionnaireAnswerValue>
  ) => {
    if (!savedProject?.id) return
    await submitAnswersMutation.mutateAsync({
      projectId: savedProject.id,
      answers: formattedAnswers,
    })
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

  const isCategoryQuestion = question?.id === 'projectType'
  const isProjectTypeQuestion =
    question?.id === 'subType' && discipline === 'architecture'
  const isDesignStyleQuestion = question?.id === 'style'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#080808] text-white">
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-[5vw] transition-all duration-300 flex items-center justify-between pointer-events-none whitespace-nowrap ${
          isScrolled
            ? 'py-4 bg-[#080808]/85 backdrop-blur-md border-b border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_25px_rgba(0,0,0,0.6)]'
            : 'py-5 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-3 whitespace-nowrap">
          <img
            src="/logo.png"
            alt="Nouh Agency"
            className="w-7 h-7 object-contain"
          />
          <span className="text-[10px] sm:text-[11px] tracking-[0.45em] text-[#C5A059] font-medium font-display uppercase whitespace-nowrap">
            NOUH AGENCY
          </span>
          <span className="hidden sm:inline text-[9px] tracking-[0.2em] text-white/35 font-display whitespace-nowrap">
            {isRTL ? 'نظام استبيان المشاريع الهرمي' : 'FORMS & BRIEFS'}
          </span>
        </div>
      </header>

      {!config ? (
        <DisciplineSelection
          onChooseDiscipline={chooseDiscipline}
          isRTL={isRTL}
        />
      ) : (
        <main className="relative min-h-[100svh] bg-[#080808] text-white overflow-hidden">
          {!isSummary && hoveredImage && (
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
              isSummary={isSummary || isQuestionnaireActive}
              canContinue={canContinue}
              config={config}
              step={step}
              totalSteps={totalSteps}
              progress={isQuestionnaireActive ? 1 : progress}
              goBack={isQuestionnaireActive ? handleBackFromQuestionnaire : goBack}
              goNext={goNext}
              isRTL={isRTL}
              isPending={createClientMutation.isPending}
            />

            {createClientMutation.isError && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-display">
                {isRTL
                  ? 'تعذر حفظ بيانات العميل في السيرفر، يرجى التحقق من صحة البيانات والمحاولة مرة أخرى.'
                  : 'Failed to save client information to the server. Please check your input and try again.'}
              </div>
            )}

            {isQuestionnaireActive ? (
              <QuestionnaireStep
                questions={questionnaireQuestions}
                projectName={savedProject?.name}
                projectId={savedProject?.id}
                isRTL={isRTL}
                onFinish={handleSubmitQuestionnaireAnswers}
                onBack={handleBackFromQuestionnaire}
              />
            ) : isSummary ? (
              <SummaryStep
                config={config}
                answers={answers}
                clientInfo={clientInfo}
                setClientInfo={setClientInfo}
                submitBrief={submitBrief}
                isRTL={isRTL}
                onSaveProject={handleSaveProject}
              />
            ) : question?.mode === 'basic_info' ? (
              <BasicInfoStep
                question={question}
                clientInfo={clientInfo}
                setClientInfo={setClientInfo}
                isRTL={isRTL}
                shortLabel={config.shortLabel}
                shortLabelAr={config.shortLabelAr}
              />
            ) : isCategoryQuestion ? (
              <CategoryStep
                question={question}
                departmentId={selectedDepartmentId}
                selectedOption={answers[question.id]?.[0]}
                onSelectOption={handleSelectCategory}
                onHoverImage={setHoveredImage}
                isRTL={isRTL}
                shortLabel={config.shortLabel}
                shortLabelAr={config.shortLabelAr}
              />
            ) : isProjectTypeQuestion ? (
              <ProjectTypeStep
                question={question}
                categoryId={selectedCategory?.id}
                selectedCategoryName={answers['projectType']?.[0]}
                selectedOption={answers[question.id]?.[0]}
                onSelectOption={handleSelectProjectType}
                onHoverImage={setHoveredImage}
                isRTL={isRTL}
                shortLabel={config.shortLabel}
                shortLabelAr={config.shortLabelAr}
              />
            ) : isDesignStyleQuestion ? (
              <DesignStyleStep
                question={question}
                selectedOptions={answers[question.id] ?? []}
                onToggleOption={handleToggleDesignStyle}
                onHoverImage={setHoveredImage}
                isRTL={isRTL}
                shortLabel={config.shortLabel}
                shortLabelAr={config.shortLabelAr}
              />
            ) : question ? (
              <QuestionStep
                question={question}
                config={config}
                answers={answers}
                clientInfo={clientInfo}
                setClientInfo={setClientInfo}
                toggleOption={toggleOption}
                setHoveredOption={(opt) => {
                  const activeOptions = question.options ?? []
                  const found = activeOptions.find((o) => o.label === opt || o.labelAr === opt)
                  setHoveredImage(found?.image ?? null)
                }}
                canContinue={canContinue}
                goNext={goNext}
                isRTL={isRTL}
              />
            ) : null}
          </div>
        </main>
      )}
    </div>
  )
}

export default StartProjectPage
