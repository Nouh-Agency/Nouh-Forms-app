import type { ProjectCategory } from '../types/projectCategory.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import CategoryStep from '../components/CategoryStep'
import { useWizard } from '../context/WizardContext'

export default function CategoryPage() {
  const {
    discipline,
    answers,
    setAnswers,
    setSelectedCategory,
    setHoveredImage,
  } = useWizard()

  const currentDiscipline = discipline ?? 'architecture'
  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === currentDiscipline) ?? PROJECT_BRIEF_DISCIPLINES[0]
  const question = config.questions.find((q) => q.id === 'projectType') ?? config.questions[1]

  const departmentId =
    currentDiscipline === 'architecture' ? 1 : currentDiscipline === 'graphic' ? 2 : 3

  const handleSelectOption = (optionValue: string, category: ProjectCategory | null) => {
    setSelectedCategory(category)
    setAnswers((prev) => ({ ...prev, [question.id]: [optionValue] }))
  }

  return (
    <CategoryStep
      question={question}
      departmentId={departmentId}
      selectedOption={answers[question.id]?.[0]}
      onSelectOption={handleSelectOption}
      onHoverImage={setHoveredImage}
      isRTL={true}
      shortLabel={config.shortLabel}
      shortLabelAr={config.shortLabelAr}
    />
  )
}
