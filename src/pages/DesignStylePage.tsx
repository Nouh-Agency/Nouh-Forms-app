import type { DesignStyle } from '../types/designStyle.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import DesignStyleStep from '../components/DesignStyleStep'
import { useWizard } from '../context/WizardContext'

export default function DesignStylePage() {
  const {
    discipline,
    answers,
    setAnswers,
    setSelectedDesignStyles,
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
        [question.id]: current.filter((v) => v !== optionValue),
      }))
      if (style) {
        setSelectedDesignStyles((prev) => prev.filter((s) => s.id !== style.id))
      }
    } else {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: [...current, optionValue],
      }))
      if (style) {
        setSelectedDesignStyles((prev) => {
          if (prev.some((s) => s.id === style.id)) return prev
          return [...prev, style]
        })
      }
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
