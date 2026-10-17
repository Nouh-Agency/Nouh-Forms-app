import { useNavigate } from 'react-router-dom'
import type { BriefDiscipline } from '../types/startProject.types'
import DisciplineSelection from '../components/DisciplineSelection'
import { useWizard } from '../context/WizardContext'

export default function DisciplinePage() {
  const navigate = useNavigate()
  const { setDiscipline } = useWizard()

  const handleChooseDiscipline = (id: BriefDiscipline) => {
    setDiscipline(id)
    navigate('/start-project/basic-info')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DisciplineSelection
      onChooseDiscipline={handleChooseDiscipline}
      isRTL={true}
    />
  )
}
