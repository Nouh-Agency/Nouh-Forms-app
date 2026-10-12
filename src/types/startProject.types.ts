export type BriefDiscipline = 'architecture' | 'graphic' | 'technology'

export type BriefOption = {
  label: string
  labelAr: string
  note?: string
  noteAr?: string
  image?: string
}

export type BriefQuestionMode = 'image' | 'words' | 'list' | 'basic_info'

export type BriefQuestion = {
  id: string
  eyebrow: string
  eyebrowAr: string
  title: string
  titleAr: string
  description?: string
  descriptionAr?: string
  multi?: boolean
  max?: number
  mode?: BriefQuestionMode
  columns?: number
  options?: BriefOption[]
  optionsByParent?: Record<string, BriefOption[]>
  parentQuestionId?: string
}

export type BriefDisciplineConfig = {
  id: BriefDiscipline
  num: string
  label: string
  labelAr: string
  shortLabel: string
  shortLabelAr: string
  title: string
  titleAr: string
  subtitle: string
  subtitleAr: string
  image: string
  questions: BriefQuestion[]
}

export type ClientBasicInfo = {
  name: string
  phone: string
  address: string
  note: string
}
