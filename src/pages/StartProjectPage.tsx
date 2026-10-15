import { useState, useEffect } from 'react'
import type { BriefDiscipline, BriefQuestion, ClientBasicInfo } from '../types/startProject.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import DisciplineSelection from '../components/DisciplineSelection'
import NavigationActions from '../components/NavigationActions'
import QuestionStep from '../components/QuestionStep'
import SummaryStep from '../components/SummaryStep'
import QuestionnaireStep from '../components/QuestionnaireStep'
import { useCreateClientMutation } from '../queries/useCreateClientMutation'
import { useCreateProjectMutation } from '../queries/useCreateProjectMutation'
import { useProjectCategoriesQuery } from '../queries/useProjectCategoriesQuery'
import { useProjectTypesQuery } from '../queries/useProjectTypesQuery'
import { useDesignStylesQuery } from '../queries/useDesignStylesQuery'
import { fetchProjectQuestionnaire } from '../api/questionnaireApi'
import { useSubmitQuestionnaireAnswersMutation } from '../queries/useSubmitQuestionnaireAnswersMutation'
import type { BriefOption } from '../types/startProject.types'
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
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
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

  const { data: projectCategories } = useProjectCategoriesQuery(selectedDepartmentId)
  const { data: projectTypes } = useProjectTypesQuery()
  const { data: designStyles } = useDesignStylesQuery()

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
      ? Boolean(
          clientInfo.name.trim() &&
          clientInfo.phone.trim() &&
          (clientInfo.email ?? '').trim() &&
          clientInfo.address.trim()
        )
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
            setHoveredOption(null)
            setStep((s) => s + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          },
        }
      )
      return
    }
    setHoveredOption(null)
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

    const selectedCategory = projectCategories?.find(
      (c) => c.name === answers['projectType']?.[0] || String(c.id) === answers['projectType']?.[0]
    )
    const selectedProjectType = projectTypes?.find(
      (pt) => pt.name === answers['subType']?.[0] || String(pt.id) === answers['subType']?.[0]
    )
    const selectedDesignStyle = designStyles?.find(
      (ds) => ds.name === answers['style']?.[0] || String(ds.id) === answers['style']?.[0]
    )

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

  const departmentCategories = (projectCategories ?? [])
    .filter((cat) => cat.department_id === selectedDepartmentId && cat.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order)

  const apiCategoryOptions: BriefOption[] = departmentCategories.map((cat) => ({
    label: cat.name,
    labelAr: cat.name,
    note: cat.description,
    noteAr: cat.description,
    image: cat.image,
  }))

  const dynamicOptionsByParent: Record<string, BriefOption[]> = {
    ...(question?.optionsByParent ?? {}),
  }

  if (projectCategories && projectTypes && projectTypes.length > 0) {
    projectCategories.forEach((cat) => {
      const typesForCat = projectTypes
        .filter((pt) => pt.project_category_id === cat.id && pt.is_active !== false)
        .sort((a, b) => a.sort_order - b.sort_order)

      if (typesForCat.length > 0) {
        const mappedOptions: BriefOption[] = typesForCat.map((pt) => ({
          label: pt.name,
          labelAr: pt.name,
          note: pt.description,
          noteAr: pt.description,
          image: pt.image,
        }))
        dynamicOptionsByParent[cat.name] = mappedOptions
        dynamicOptionsByParent[String(cat.id)] = mappedOptions
      }
    })
  }

  const activeDesignStyles = (designStyles ?? [])
    .filter((s) => s.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order)

  const apiDesignStyleOptions: BriefOption[] = activeDesignStyles.map((item) => ({
    label: item.name,
    labelAr: item.name,
    note: item.description,
    noteAr: item.description,
    image: item.image,
  }))

  const effectiveQuestion =
    question && question.id === 'projectType' && apiCategoryOptions.length > 0
      ? { ...question, options: apiCategoryOptions }
      : question && question.parentQuestionId === 'projectType' && projectTypes && projectTypes.length > 0
        ? { ...question, optionsByParent: dynamicOptionsByParent }
        : question && question.id === 'style' && apiDesignStyleOptions.length > 0
          ? { ...question, options: apiDesignStyleOptions }
          : question

  const mode = effectiveQuestion?.mode ?? 'list'
  const activeOptions = effectiveQuestion?.options ?? (
    effectiveQuestion?.parentQuestionId && effectiveQuestion?.optionsByParent
      ? effectiveQuestion.optionsByParent[(answers[effectiveQuestion.parentQuestionId] ?? [])[0]] ??
        Object.values(effectiveQuestion.optionsByParent)[0] ?? []
      : []
  )
  const hoveredImage = activeOptions.find(
    (option) => option.label === hoveredOption || option.labelAr === hoveredOption
  )?.image

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
            ) : effectiveQuestion ? (
              <QuestionStep
                question={effectiveQuestion}
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
            ) : null}
          </div>
        </main>
      )}
    </div>
  )
}

export default StartProjectPage
