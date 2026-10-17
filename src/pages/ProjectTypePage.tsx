import type { ProjectType } from '../types/projectType.types'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import ProjectTypeStep from '../components/ProjectTypeStep'
import { useWizard } from '../context/WizardContext'

export default function ProjectTypePage() {
  const {
    discipline,
    answers,
    setAnswers,
    selectedCategory,
    setSelectedProjectType,
    setHoveredImage,
  } = useWizard()

  const currentDiscipline = discipline ?? 'architecture'
  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === currentDiscipline) ?? PROJECT_BRIEF_DISCIPLINES[0]
  const question = config.questions.find((q) => q.id === 'subType') ?? config.questions[2]

  const handleSelectOption = (optionValue: string, projectType: ProjectType | null) => {
    setSelectedProjectType(projectType)
    setAnswers((prev) => ({ ...prev, [question.id]: [optionValue] }))
  }

  return (
    <ProjectTypeStep
      question={question}
      categoryId={selectedCategory?.id}
      selectedCategoryName={answers['projectType']?.[0]}
      selectedOption={answers[question.id]?.[0]}
      onSelectOption={handleSelectOption}
      onHoverImage={setHoveredImage}
      isRTL={true}
      shortLabel={config.shortLabel}
      shortLabelAr={config.shortLabelAr}
    />
  )
}
