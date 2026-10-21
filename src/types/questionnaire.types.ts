export interface QuestionnaireAnswerType {
  id: number
  name: string
  code: string
  has_options: boolean
  allows_multiple: boolean
}

export interface QuestionnaireSection {
  id: number
  name: string
  description?: string | null
  sort_order: number
}

export interface QuestionnaireOption {
  id: number
  question_id?: number
  label?: string
  value?: string
  name?: string
  title?: string
}

export interface QuestionnaireCondition {
  depends_on_question_id: number
  depends_on_question?: {
    id: number
    title: string
  } | null
  operator: string
  question_option_id?: number | null
  value?: string | number | null
  logic_type?: 'AND' | 'OR' | string
}

export interface QuestionnaireValidationRules {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  min_length?: number
  max_length?: number
  pattern?: string
  regex?: string
  numeric?: boolean
  email?: boolean
  step?: number | string
  format?: string
  rows?: string[]
  columns?: string[]
  [key: string]: unknown
}

export interface QuestionnaireQuestion {
  id: number
  title: string
  description?: string | null
  placeholder?: string | null
  is_required: boolean
  sort_order: number
  validation_rules?: QuestionnaireValidationRules | Record<string, unknown> | null
  section?: QuestionnaireSection | null
  answer_type: QuestionnaireAnswerType
  options?: QuestionnaireOption[]
  conditions?: QuestionnaireCondition[]
}

export interface QuestionnaireResponse {
  data: QuestionnaireQuestion[]
}

export type QuestionnaireAnswerValue =
  | string
  | number
  | boolean
  | File
  | File[]
  | (string | number | File)[]
  | Record<string, string>
  | Array<{ row: string; column: string }>

export interface SubmitQuestionnaireAnswersPayload {
  answers: Record<string, QuestionnaireAnswerValue>
}

export interface SubmitQuestionnaireAnswersResponse {
  message?: string
  data?: unknown
}

export interface AdditionalQuestionItem {
  question: string
  answer: string | null
  notes?: string | null
}

export interface SubmitAdditionalQuestionsPayload {
  additional_questions: AdditionalQuestionItem[]
}

export interface SubmitAdditionalQuestionsResponse {
  message?: string
  data?: unknown
}

