import type { DesignStyle } from '../types/designStyle.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import DesignStyleStep from '../components/DesignStyleStep'
import { useWizard } from '../context/WizardContext'

export default function DesignStylePage() {
  const {
    discipline,
    answers,
    setAnswers,
    setSelectedDesignStyle,
    setHoveredImage,
  } = useWizard()

  const currentDiscipline = discipline ?? 'architecture'
  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === currentDiscipline) ?? PROJECT_BRIEF_DISCIPLINES[0]
  const question = config.questions.find((q) => q.id === 'style' || q.id === 'styles') ?? config.questions[3]

  const handleToggleOption = (optionValue: string, style: DesignStyle | null) => {
    const current = answers[question.id] ?? []
    if (current.includes(optionValue)) {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: [],
      }))
      setSelectedDesignStyle(null)
    } else {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: [optionValue],
      }))
      setSelectedDesignStyle(style)
    }
  }

  return (
    <DesignStyleStep
      question={question}
      selectedOptions={answers[question.id] ?? []}
      onToggleOption={handleToggleOption}
      onHoverImage={setHoveredImage}
      isRTL={true}
      shortLabel={config.shortLabel}
      shortLabelAr={config.shortLabelAr}
    />
  )
}
