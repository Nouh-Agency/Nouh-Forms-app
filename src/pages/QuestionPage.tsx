import { useParams, Navigate } from 'react-router-dom'
import type { BriefQuestion } from '../types/startProject.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import QuestionStep from '../components/QuestionStep'
import { useWizard } from '../context/WizardContext'

export default function QuestionPage() {
  const { questionId } = useParams<{ questionId: string }>()
  const {
    discipline,
    answers,
    setAnswers,
    clientInfo,
    setClientInfo,
    setHoveredImage,
  } = useWizard()

  const currentDiscipline = discipline ?? 'architecture'
  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === currentDiscipline) ?? PROJECT_BRIEF_DISCIPLINES[0]
  const question = config.questions.find((q) => q.id === questionId)

  if (!question) {
    return <Navigate to="/start-project/category" replace />
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

  return (
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
      isRTL={true}
    />
  )
}
