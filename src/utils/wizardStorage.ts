import type { BriefDiscipline, ClientBasicInfo } from '../types/startProject.types'
import type { ProjectCategory } from '../types/projectCategory.types'
import type { ProjectType } from '../types/projectType.types'
import type { DesignStyle } from '../types/designStyle.types'

export const WIZARD_STORAGE_KEY = 'nouh_start_project_wizard_v1'
export const WIZARD_STORAGE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000

export interface WizardStorageSchema {
  version: 1
  timestamp: number
  discipline: BriefDiscipline | null
  clientInfo: ClientBasicInfo
  createdClientId: number | null
  clientInfoHash?: string
  answers: Record<string, string[]>
  selectedCategory: ProjectCategory | null
  selectedProjectType: ProjectType | null
  selectedDesignStyle: DesignStyle | null
  savedProject: { id: number; name: string } | null
  savedProjectHash?: string
  questionnaireAnswers?: Record<number, string | string[]>
  currentPath: string
}

export function computeClientHash(info: ClientBasicInfo): string {
  return `${info.name.trim().toLowerCase()}_${info.phone.trim()}_${(info.email ?? '').trim().toLowerCase()}_${info.address.trim().toLowerCase()}`
}

export function computeProjectSignature(
  discipline: BriefDiscipline | null,
  clientInfo: ClientBasicInfo,
  selectedCategory: ProjectCategory | null,
  selectedProjectType: ProjectType | null,
  selectedDesignStyle: DesignStyle | null,
  answers: Record<string, string[]>
): string {
  const sortedAnswers = Object.keys(answers)
    .sort()
    .map((k) => `${k}:${(answers[k] ?? []).join(',')}`)
    .join('|')
  return [
    discipline ?? '',
    clientInfo.name.trim().toLowerCase(),
    clientInfo.note.trim(),
    selectedCategory?.id ?? '',
    selectedProjectType?.id ?? '',
    selectedDesignStyle?.id ?? '',
    sortedAnswers,
  ].join('__')
}

export function loadWizardStorage(): WizardStorageSchema | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<WizardStorageSchema>
    if (!parsed || parsed.version !== 1 || typeof parsed.timestamp !== 'number') {
      window.localStorage.removeItem(WIZARD_STORAGE_KEY)
      return null
    }

    const age = Date.now() - parsed.timestamp
    if (age > WIZARD_STORAGE_EXPIRATION_MS) {
      window.localStorage.removeItem(WIZARD_STORAGE_KEY)
      return null
    }

    return parsed as WizardStorageSchema
  } catch {
    return null
  }
}

export function saveWizardStorage(data: Omit<WizardStorageSchema, 'version' | 'timestamp'>): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    const payload: WizardStorageSchema = {
      ...data,
      version: 1,
      timestamp: Date.now(),
    }
    window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(payload))
  } catch {}
}

export function clearWizardStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    window.localStorage.removeItem(WIZARD_STORAGE_KEY)
  } catch {}
}
