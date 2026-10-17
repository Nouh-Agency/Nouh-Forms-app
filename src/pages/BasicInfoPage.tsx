import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import BasicInfoStep from '../components/BasicInfoStep'
import { useWizard } from '../context/WizardContext'

export default function BasicInfoPage() {
  const { discipline, clientInfo, setClientInfo } = useWizard()

  const currentDiscipline = discipline ?? 'architecture'
  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === currentDiscipline) ?? PROJECT_BRIEF_DISCIPLINES[0]
  const question = config.questions.find((q) => q.mode === 'basic_info') ?? config.questions[0]

  return (
    <BasicInfoStep
      question={question}
      clientInfo={clientInfo}
      setClientInfo={setClientInfo}
      isRTL={true}
      shortLabel={config.shortLabel}
      shortLabelAr={config.shortLabelAr}
    />
  )
}
