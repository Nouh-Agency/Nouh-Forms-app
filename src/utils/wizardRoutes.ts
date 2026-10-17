import type { BriefDiscipline } from '../types/startProject.types'

export interface WizardRouteStep {
  path: string
  id: string
  titleAr: string
  titleEn: string
}

export function getDisciplineSteps(discipline: BriefDiscipline): WizardRouteStep[] {
  const commonFirst: WizardRouteStep[] = [
    { path: '/start-project/discipline', id: 'discipline', titleAr: 'اختيار التخصص', titleEn: 'Discipline' },
    { path: '/start-project/basic-info', id: 'basicInfo', titleAr: 'بيانات العميل', titleEn: 'Client Info' },
    { path: '/start-project/category', id: 'projectType', titleAr: 'اختيار النوع', titleEn: 'Category' },
  ]

  const summaryStep: WizardRouteStep = {
    path: '/start-project/summary',
    id: 'summary',
    titleAr: 'الملخص والاعتماد',
    titleEn: 'Summary',
  }

  if (discipline === 'architecture') {
    return [
      ...commonFirst,
      { path: '/start-project/project-type', id: 'subType', titleAr: 'الأعمال والمنشآت', titleEn: 'Specific Works' },
      { path: '/start-project/design-style', id: 'style', titleAr: 'الأنماط المعمارية', titleEn: 'Architectural Style' },
      summaryStep,
    ]
  }

  return [
    ...commonFirst,
    { path: '/start-project/project-type', id: 'subType', titleAr: 'الأعمال والأنواع المحددة', titleEn: 'Specific Works' },
    summaryStep,
  ]
}

export function getNextStepPath(currentPath: string, discipline: BriefDiscipline): string | null {
  const steps = getDisciplineSteps(discipline)
  const currentIndex = steps.findIndex((s) => s.path === currentPath)
  if (currentIndex >= 0 && currentIndex < steps.length - 1) {
    return steps[currentIndex + 1].path
  }
  return null
}

export function getPrevStepPath(currentPath: string, discipline: BriefDiscipline): string | null {
  const steps = getDisciplineSteps(discipline)
  const currentIndex = steps.findIndex((s) => s.path === currentPath)
  if (currentIndex > 0) {
    return steps[currentIndex - 1].path
  }
  return null
}
