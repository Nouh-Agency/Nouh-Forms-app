import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { BriefDiscipline, ClientBasicInfo } from '../types/startProject.types'
import type { ProjectCategory } from '../types/projectCategory.types'
import type { ProjectType } from '../types/projectType.types'
import type { DesignStyle } from '../types/designStyle.types'
import {
  loadWizardStorage,
  saveWizardStorage,
  clearWizardStorage,
  computeClientHash,
  computeProjectSignature,
  type WizardStorageSchema,
} from '../utils/wizardStorage'

interface WizardContextType {
  discipline: BriefDiscipline | null
  setDiscipline: (d: BriefDiscipline | null) => void
  clientInfo: ClientBasicInfo
  setClientInfo: Dispatch<SetStateAction<ClientBasicInfo>>
  createdClientId: number | null
  setCreatedClientId: Dispatch<SetStateAction<number | null>>
  clientInfoHash: string | undefined
  answers: Record<string, string[]>
  setAnswers: Dispatch<SetStateAction<Record<string, string[]>>>
  selectedCategory: ProjectCategory | null
  setSelectedCategory: Dispatch<SetStateAction<ProjectCategory | null>>
  selectedProjectType: ProjectType | null
  setSelectedProjectType: Dispatch<SetStateAction<ProjectType | null>>
  selectedDesignStyle: DesignStyle | null
  setSelectedDesignStyle: Dispatch<SetStateAction<DesignStyle | null>>
  selectedDesignStyles: DesignStyle[]
  setSelectedDesignStyles: Dispatch<SetStateAction<DesignStyle[]>>
  savedProject: { id: number; name: string } | null
  setSavedProject: Dispatch<SetStateAction<{ id: number; name: string } | null>>
  savedProjectHash: string | undefined
  setSavedProjectHash: Dispatch<SetStateAction<string | undefined>>
  questionnaireAnswers: Record<number, string | string[]>
  setQuestionnaireAnswers: Dispatch<SetStateAction<Record<number, string | string[]>>>
  hoveredImage: string | null
  setHoveredImage: Dispatch<SetStateAction<string | null>>
  currentPath: string
  setCurrentPath: (path: string) => void
  hasSavedDraft: boolean
  discardDraft: () => void
  clearCompletedWizard: () => void
  isHydrated: boolean
}

const defaultClientInfo: ClientBasicInfo = {
  name: '',
  phone: '',
  email: '',
  address: '',
  note: '',
}

const WizardContext = createContext<WizardContextType | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [initialData] = useState<WizardStorageSchema | null>(() => loadWizardStorage())
  const [isHydrated] = useState(true)
  const isClearedRef = useRef(false)

  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() =>
    Boolean(
      initialData &&
        (initialData.discipline ||
          initialData.clientInfo?.name?.trim() ||
          Object.keys(initialData.answers ?? {}).length > 0)
    )
  )

  const [discipline, setDisciplineState] = useState<BriefDiscipline | null>(
    () => initialData?.discipline ?? null
  )
  const [clientInfo, setClientInfo] = useState<ClientBasicInfo>(
    () => initialData?.clientInfo ?? defaultClientInfo
  )
  const [createdClientId, setCreatedClientId] = useState<number | null>(
    () => initialData?.createdClientId ?? null
  )
  const [clientInfoHash, setClientInfoHash] = useState<string | undefined>(
    () => initialData?.clientInfoHash
  )
  const [answers, setAnswers] = useState<Record<string, string[]>>(
    () => initialData?.answers ?? {}
  )
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(
    () => initialData?.selectedCategory ?? null
  )
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(
    () => initialData?.selectedProjectType ?? null
  )
  const [selectedDesignStyles, setSelectedDesignStyles] = useState<DesignStyle[]>(
    () =>
      initialData?.selectedDesignStyles ??
      (initialData?.selectedDesignStyle ? [initialData.selectedDesignStyle] : [])
  )
  const selectedDesignStyle = selectedDesignStyles[0] ?? null
  const setSelectedDesignStyle: Dispatch<SetStateAction<DesignStyle | null>> = (action) => {
    setSelectedDesignStyles((prev) => {
      const next = typeof action === 'function' ? action(prev[0] ?? null) : action
      return next ? [next] : []
    })
  }
  const [savedProject, setSavedProject] = useState<{ id: number; name: string } | null>(
    () => initialData?.savedProject ?? null
  )
  const [savedProjectHash, setSavedProjectHash] = useState<string | undefined>(
    () => initialData?.savedProjectHash
  )
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<number, string | string[]>>(
    () => initialData?.questionnaireAnswers ?? {}
  )
  const [currentPath, setCurrentPath] = useState<string>(
    () => initialData?.currentPath ?? '/start-project/discipline'
  )
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)

  const setDiscipline = (newDiscipline: BriefDiscipline | null) => {
    isClearedRef.current = false
    if (newDiscipline !== discipline) {
      setSelectedCategory(null)
      setSelectedProjectType(null)
      setSelectedDesignStyles([])
      setSavedProject(null)
      setSavedProjectHash(undefined)
      setAnswers({})
      setQuestionnaireAnswers({})
    }
    setDisciplineState(newDiscipline)
  }

  useEffect(() => {
    const currentHash = computeClientHash(clientInfo)
    if (createdClientId && clientInfoHash && clientInfoHash !== currentHash) {
      setCreatedClientId(null)
      setClientInfoHash(undefined)
    }
  }, [clientInfo, createdClientId, clientInfoHash])

  useEffect(() => {
    if (savedProject && savedProjectHash) {
      const currentSignature = computeProjectSignature(
        discipline,
        clientInfo,
        selectedCategory,
        selectedProjectType,
        selectedDesignStyles,
        answers
      )
      if (currentSignature !== savedProjectHash) {
        setSavedProject(null)
        setSavedProjectHash(undefined)
      }
    }
  }, [
    discipline,
    clientInfo,
    selectedCategory,
    selectedProjectType,
    selectedDesignStyles,
    answers,
    savedProject,
    savedProjectHash,
  ])

  useEffect(() => {
    if (isClearedRef.current) {
      clearWizardStorage()
      return
    }

    const hasAnyDraftData = Boolean(
      discipline !== null ||
        clientInfo.name.trim() !== '' ||
        clientInfo.phone.trim() !== '' ||
        Object.keys(answers).length > 0 ||
        savedProject !== null ||
        Object.keys(questionnaireAnswers).length > 0
    )

    if (!hasAnyDraftData) {
      clearWizardStorage()
      return
    }

    saveWizardStorage({
      discipline,
      clientInfo,
      createdClientId,
      clientInfoHash: createdClientId ? computeClientHash(clientInfo) : clientInfoHash,
      answers,
      selectedCategory,
      selectedProjectType,
      selectedDesignStyle,
      selectedDesignStyles,
      savedProject,
      savedProjectHash,
      questionnaireAnswers,
      currentPath,
    })
  }, [
    discipline,
    clientInfo,
    createdClientId,
    clientInfoHash,
    answers,
    selectedCategory,
    selectedProjectType,
    selectedDesignStyles,
    savedProject,
    savedProjectHash,
    questionnaireAnswers,
    currentPath,
  ])

  const clearCompletedWizard = () => {
    isClearedRef.current = true
    clearWizardStorage()
    setHasSavedDraft(false)
    setDisciplineState(null)
    setClientInfo(defaultClientInfo)
    setCreatedClientId(null)
    setClientInfoHash(undefined)
    setAnswers({})
    setSelectedCategory(null)
    setSelectedProjectType(null)
    setSelectedDesignStyles([])
    setSavedProject(null)
    setSavedProjectHash(undefined)
    setQuestionnaireAnswers({})
    setCurrentPath('/start-project/discipline')
    setHoveredImage(null)
  }

  const discardDraft = () => {
    isClearedRef.current = true
    clearWizardStorage()
    setHasSavedDraft(false)
    setDisciplineState(null)
    setClientInfo(defaultClientInfo)
    setCreatedClientId(null)
    setClientInfoHash(undefined)
    setAnswers({})
    setSelectedCategory(null)
    setSelectedProjectType(null)
    setSelectedDesignStyles([])
    setSavedProject(null)
    setSavedProjectHash(undefined)
    setQuestionnaireAnswers({})
    setCurrentPath('/start-project/discipline')
    setHoveredImage(null)
  }

  return (
    <WizardContext.Provider
      value={{
        discipline,
        setDiscipline,
        clientInfo,
        setClientInfo,
        createdClientId,
        setCreatedClientId,
        clientInfoHash,
        answers,
        setAnswers,
        selectedCategory,
        setSelectedCategory,
        selectedProjectType,
        setSelectedProjectType,
        selectedDesignStyle,
        setSelectedDesignStyle,
        selectedDesignStyles,
        setSelectedDesignStyles,
        savedProject,
        setSavedProject,
        savedProjectHash,
        setSavedProjectHash,
        questionnaireAnswers,
        setQuestionnaireAnswers,
        hoveredImage,
        setHoveredImage,
        currentPath,
        setCurrentPath,
        hasSavedDraft,
        discardDraft,
        clearCompletedWizard,
        isHydrated,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
