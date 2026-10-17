import { useNavigate } from 'react-router-dom'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import SummaryStep from '../components/SummaryStep'
import { useWizard } from '../context/WizardContext'
import { useCreateClientMutation } from '../queries/useCreateClientMutation'
import { useCreateProjectMutation } from '../queries/useCreateProjectMutation'
import type { CreateProjectPayload } from '../types/project.types'
import { computeProjectSignature } from '../utils/wizardStorage'

export default function SummaryPage() {
  const navigate = useNavigate()

  const {
    discipline,
    clientInfo,
    setClientInfo,
    answers,
    createdClientId,
    setCreatedClientId,
    selectedCategory,
    selectedProjectType,
    selectedDesignStyle,
    savedProject,
    setSavedProject,
    savedProjectHash,
    setSavedProjectHash,
  } = useWizard()

  const createClientMutation = useCreateClientMutation()
  const createProjectMutation = useCreateProjectMutation()

  const currentDiscipline = discipline ?? 'architecture'
  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === currentDiscipline) ?? PROJECT_BRIEF_DISCIPLINES[0]

  const selectedDepartmentId =
    currentDiscipline === 'architecture' ? 1 : currentDiscipline === 'graphic' ? 2 : 3

  const submitBrief = () => {
    if (!config || !clientInfo.name) return

    const summaryLines = config.questions
      .filter((q) => q.mode !== 'basic_info')
      .map((q) => `${q.titleAr}:\n${(answers[q.id] ?? []).join(', ') || '—'}`)
      .join('\n\n')

    const body = [
      `ملف العميل: ${clientInfo.name}`,
      `القسم: ${config.labelAr}`,
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
      `ملف العميل: ${clientInfo.name} — ${config.labelAr}`
    )}&body=${encodeURIComponent(body)}`
  }

  const handleSaveProject = async () => {
    const currentSignature = computeProjectSignature(
      discipline,
      clientInfo,
      selectedCategory,
      selectedProjectType,
      selectedDesignStyle,
      answers
    )

    if (savedProject?.id && savedProjectHash === currentSignature) {
      navigate(`/start-project/questionnaire/${savedProject.id}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

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
    setSavedProject({ id: createdProject.id, name: createdProject.project_name })
    setSavedProjectHash(currentSignature)
    navigate(`/start-project/questionnaire/${createdProject.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <SummaryStep
      config={config}
      answers={answers}
      clientInfo={clientInfo}
      setClientInfo={setClientInfo}
      submitBrief={submitBrief}
      isRTL={true}
      onSaveProject={handleSaveProject}
    />
  )
}
