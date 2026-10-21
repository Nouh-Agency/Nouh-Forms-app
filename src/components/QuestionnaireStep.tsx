import { useState, type FormEvent } from 'react'
import type {
  QuestionnaireQuestion,
  QuestionnaireAnswerValue,
  AdditionalQuestionItem,
} from '../types/questionnaire.types'
import { ArrowUpRightIcon, CheckIcon, StarIcon } from './Icons'
import { encodeProjectId } from '../utils/projectToken'

interface ParsedValidationRules {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  numeric?: boolean
  email?: boolean
  step?: number | string
  format?: string
  rows?: string[]
  columns?: string[]
}

interface CustomQuestion {
  id: string
  question: string
  answer: string
  notes: string
}

interface QuestionnaireStepProps {
  questions: QuestionnaireQuestion[]
  projectName?: string
  projectId?: number
  isRTL?: boolean
  initialAnswers?: Record<number, string | string[]>
  onAnswersChange?: (answers: Record<number, string | string[]>) => void
  onFinish?: (
    answers: Record<string, QuestionnaireAnswerValue>,
    additionalQuestions: AdditionalQuestionItem[]
  ) => Promise<void> | void
  onBack?: () => void
}

export default function QuestionnaireStep({
  questions,
  projectName,
  projectId,
  isRTL = true,
  initialAnswers,
  onAnswersChange,
  onFinish,
  onBack,
}: QuestionnaireStepProps) {
  const [answers, setAnswers] = useState<Record<number, string | string[]>>(() => initialAnswers ?? {})
  const [fileAnswers, setFileAnswers] = useState<Record<number, File[]>>({})
  const [hoveredStars, setHoveredStars] = useState<Record<number, number>>({})
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([])
  const [customQuestionErrors, setCustomQuestionErrors] = useState<Record<string, string>>({})

  const handleAddCustomQuestion = () => {
    const newId = `cq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    setCustomQuestions((prev) => [...prev, { id: newId, question: '', answer: '', notes: '' }])
  }

  const handleRemoveCustomQuestion = (id: string) => {
    setCustomQuestions((prev) => prev.filter((item) => item.id !== id))
    setCustomQuestionErrors((prev) => {
      const nextErrors = { ...prev }
      delete nextErrors[`q_${id}`]
      delete nextErrors[`a_${id}`]
      delete nextErrors[`n_${id}`]
      return nextErrors
    })
  }

  const handleUpdateCustomQuestion = (
    id: string,
    field: 'question' | 'answer' | 'notes',
    value: string
  ) => {
    setCustomQuestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
    if (value.trim()) {
      setCustomQuestionErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors[`${field === 'question' ? 'q' : field === 'answer' ? 'a' : 'n'}_${id}`]
        return nextErrors
      })
    }
  }

  const getRangeValue = (questionId: number): { from: string; to: string } => {
    const current = answers[questionId]
    if (typeof current === 'string' && current.startsWith('{')) {
      try {
        return JSON.parse(current)
      } catch {
        return { from: '', to: '' }
      }
    }
    return { from: '', to: '' }
  }

  const getGridValue = (questionId: number): Record<string, string> => {
    const current = answers[questionId]
    if (typeof current === 'string' && current.startsWith('{')) {
      try {
        return JSON.parse(current)
      } catch {
        return {}
      }
    }
    return {}
  }

  const getFieldType = (q: QuestionnaireQuestion) => {
    const code = q.answer_type.code?.toLowerCase() || ''
    const name = q.answer_type.name?.toLowerCase() || ''
    const rules = q.validation_rules as Record<string, unknown> | null | undefined

    if (
      code === 'multiple_choice_grid' ||
      code.includes('grid') ||
      name.includes('شبكة') ||
      name.includes('مصفوفة') ||
      (rules && Array.isArray(rules.rows) && Array.isArray(rules.columns))
    ) {
      return 'grid'
    }
    if (name.includes('نجوم') || name.includes('تقييم') || code.includes('star') || code.includes('rating')) {
      return 'rating'
    }
    if (name.includes('نعم') || name.includes('لا') || code === 'boolean' || code === 'yes_no') {
      return 'yes_no'
    }
    if (code === 'date_range' || code === 'datetime_range' || name.includes('رينج')) {
      return 'duration'
    }
    if (name.includes('مقياس') || code === 'linear_scale' || code === 'scale') {
      return 'linear_scale'
    }
    if (name.includes('تاريخ') || code === 'date') {
      return 'date'
    }
    if (
      name.includes('توقيت') ||
      name.includes('وقت') ||
      name.includes('مدة') ||
      code === 'time' ||
      code === 'duration' ||
      Boolean(rules && typeof rules.format === 'string' && (rules.format.includes('HH') || rules.format.includes('H:')))
    ) {
      return 'time'
    }
    if (name.includes('رقم') || code === 'number' || code === 'numeric' || code === 'integer') {
      return 'number'
    }
    if (name.includes('فقرة') || code === 'long_text' || code === 'textarea' || code === 'paragraph') {
      return 'paragraph'
    }
    if (
      code === 'file' ||
      code === 'attachment' ||
      code === 'upload' ||
      code === 'document' ||
      code === 'image' ||
      code.includes('file') ||
      code.includes('upload') ||
      code.includes('attach') ||
      name.includes('ملف') ||
      name.includes('مرفق') ||
      name.includes('مستند') ||
      name.includes('صورة') ||
      name.includes('file') ||
      name.includes('upload') ||
      name.includes('attach') ||
      q.title.toLowerCase().includes('ارفع ملف') ||
      q.title.toLowerCase().includes('ملفات مرجعية') ||
      q.title.toLowerCase().includes('مرفقات')
    ) {
      return 'file'
    }
    if (q.answer_type.has_options && q.options && q.options.length > 0) {
      return 'options'
    }
    return 'short_text'
  }

  const isHalfWidthQuestion = (q: QuestionnaireQuestion): boolean => {
    const title = q.title.toLowerCase()
    return (
      title.includes('الميزانية التقديرية') ||
      title.includes('التاريخ المفضل') ||
      title.includes('الوقت المناسب') ||
      title.includes('مدة الاجتماع') ||
      title.includes('estimated budget') ||
      title.includes('preferred start date') ||
      title.includes('meeting time') ||
      title.includes('meeting duration')
    )
  }

  const parseValidationRules = (rules: unknown): ParsedValidationRules => {
    if (!rules) return {}

    const result: ParsedValidationRules = {}

    if (typeof rules === 'string') {
      const trimmed = rules.trim()
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed)
          return parseValidationRules(parsed)
        } catch {
        }
      }
      const parts = trimmed.split('|')
      parts.forEach((part) => {
        const item = part.trim()
        if (item === 'required') result.required = true
        else if (item === 'numeric' || item === 'integer') result.numeric = true
        else if (item === 'email') result.email = true
        else if (item.startsWith('min:')) result.min = Number(item.replace('min:', ''))
        else if (item.startsWith('max:')) result.max = Number(item.replace('max:', ''))
        else if (item.startsWith('regex:')) result.pattern = item.replace('regex:', '')
        else if (item.startsWith('format:')) result.format = item.replace('format:', '').trim()
      })
      return result
    }

    if (Array.isArray(rules)) {
      rules.forEach((rule) => {
        if (typeof rule === 'string') {
          const item = rule.trim()
          if (item === 'required') result.required = true
          else if (item === 'numeric' || item === 'integer') result.numeric = true
          else if (item === 'email') result.email = true
          else if (item.startsWith('min:')) result.min = Number(item.replace('min:', ''))
          else if (item.startsWith('max:')) result.max = Number(item.replace('max:', ''))
          else if (item.startsWith('regex:')) result.pattern = item.replace('regex:', '')
          else if (item.startsWith('format:')) result.format = item.replace('format:', '').trim()
        }
      })
      return result
    }

    if (typeof rules === 'object') {
      const rec = rules as Record<string, unknown>
      if (rec.required !== undefined) result.required = Boolean(rec.required)
      if (rec.min !== undefined && rec.min !== null) result.min = Number(rec.min)
      if (rec.max !== undefined && rec.max !== null) result.max = Number(rec.max)
      if (rec.min_length !== undefined && rec.min_length !== null) result.minLength = Number(rec.min_length)
      if (rec.minLength !== undefined && rec.minLength !== null) result.minLength = Number(rec.minLength)
      if (rec.max_length !== undefined && rec.max_length !== null) result.maxLength = Number(rec.max_length)
      if (rec.maxLength !== undefined && rec.maxLength !== null) result.maxLength = Number(rec.maxLength)
      if (rec.regex !== undefined && rec.regex !== null) result.pattern = String(rec.regex)
      if (rec.pattern !== undefined && rec.pattern !== null) result.pattern = String(rec.pattern)
      if (rec.numeric !== undefined) result.numeric = Boolean(rec.numeric)
      if (rec.email !== undefined) result.email = Boolean(rec.email)
      if (rec.step !== undefined && rec.step !== null) result.step = typeof rec.step === 'number' ? rec.step : String(rec.step)
      if (rec.format !== undefined && rec.format !== null) result.format = String(rec.format)
      if (Array.isArray(rec.rows)) {
        result.rows = rec.rows.map(String)
      }
      if (Array.isArray(rec.columns)) {
        result.columns = rec.columns.map(String)
      }
      return result
    }

    return result
  }

  const validateQuestion = (q: QuestionnaireQuestion, val: unknown): string | null => {
    const rules = parseValidationRules(q.validation_rules)
    const isRequired = q.is_required || rules.required
    const fieldType = getFieldType(q)

    if (fieldType === 'file') {
      const files = Array.isArray(val) ? val : fileAnswers[q.id] || []
      if (isRequired && files.length === 0) {
        return isRTL ? 'يرجى إرفاق ملف' : 'Please upload a file'
      }
      const hasOverMax = files.some((f) => f instanceof File && f.size > 10 * 1024 * 1024)
      if (hasOverMax) {
        return isRTL ? 'حجم الملف يتجاوز 10 ميغابايت' : 'File size exceeds 10 MB'
      }
      return null
    }

    const isEmpty =
      val === undefined ||
      val === null ||
      val === '' ||
      (Array.isArray(val) && val.length === 0)

    if (isRequired && isEmpty) {
      if (fieldType === 'grid') {
        return isRTL ? 'يرجى الإجابة على جميع صفوف الشبكة' : 'Please select an option for each row'
      } else if (fieldType === 'duration') {
        const range = getRangeValue(q.id)
        if (!range.from && !range.to) {
          return isRTL ? 'يرجى تحديد المدة الزمنية' : 'Please specify the duration'
        }
      } else if (fieldType === 'options') {
        return isRTL ? 'يرجى اختيار خيار واحد على الأقل' : 'Please select at least one option'
      } else if (fieldType === 'rating') {
        return isRTL ? 'يرجى تحديد التقييم' : 'Please select a rating'
      } else if (fieldType === 'yes_no') {
        return isRTL ? 'يرجى اختيار نعم أو لا' : 'Please select Yes or No'
      }
      return isRTL ? 'هذا الحقل مطلوب' : 'This field is required'
    }

    if (fieldType === 'grid') {
      let grid: Record<string, string> = {}
      if (typeof val === 'string' && val.startsWith('{')) {
        try {
          grid = JSON.parse(val)
        } catch {
          grid = {}
        }
      } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        grid = val as Record<string, string>
      }
      const rows = rules.rows || []
      const answeredCount = rows.filter((r) => Boolean(grid[r])).length
      if (isRequired && (rows.length === 0 ? answeredCount === 0 : answeredCount < rows.length)) {
        return isRTL ? 'يرجى الإجابة على جميع صفوف الشبكة' : 'Please select an option for each row'
      }
      return null
    }

    if (fieldType === 'duration') {
      const range = getRangeValue(q.id)
      if (isRequired && (!range.from || !range.to)) {
        return isRTL ? 'يرجى تحديد تاريخي البداية والنهاية' : 'Please specify both start and end dates'
      }
      if (range.from && range.to && new Date(range.from) > new Date(range.to)) {
        return isRTL ? 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' : 'Start date must be before end date'
      }
    }

    if (!isEmpty) {
      if (fieldType === 'linear_scale') {
        const num = Number(val)
        if (isNaN(num)) {
          return isRTL ? 'يرجى إدخال قيمة رقمية بين 1 و 5' : 'Please enter a numeric value between 1 and 5'
        }
        if (num < 1 || num > 5) {
          return isRTL ? 'القيمة يجب أن تكون بين 1 و 5' : 'Value must be between 1 and 5'
        }
      } else if (fieldType === 'number' || rules.numeric) {
        const num = Number(val)
        if (isNaN(num)) {
          return isRTL ? 'يرجى إدخال قيمة رقمية صحيحة' : 'Please enter a valid numeric value'
        }
        if (rules.min !== undefined && num < rules.min) {
          return isRTL ? `القيمة يجب أن تكون ${rules.min} كحد أدنى` : `Value must be at least ${rules.min}`
        }
        if (rules.max !== undefined && num > rules.max) {
          return isRTL ? `القيمة يجب ألا تتجاوز ${rules.max}` : `Value must not exceed ${rules.max}`
        }
      } else if (fieldType === 'options' && q.answer_type.allows_multiple) {
        const count = Array.isArray(val) ? val.length : 1
        if (rules.min !== undefined && count < rules.min) {
          return isRTL ? `يرجى اختيار ${rules.min} خيارات كحد أدنى` : `Please select at least ${rules.min} options`
        }
        if (rules.max !== undefined && count > rules.max) {
          return isRTL ? `لا يمكن اختيار أكثر من ${rules.max} خيارات` : `Cannot select more than ${rules.max} options`
        }
      } else if (fieldType === 'short_text' || fieldType === 'paragraph') {
        const str = String(val).trim()
        const minLen = rules.minLength ?? (rules.min !== undefined ? rules.min : undefined)
        if (minLen !== undefined && str.length < minLen) {
          return isRTL ? `يجب إدخال ${minLen} أحرف على الأقل` : `Must be at least ${minLen} characters`
        }
        const maxLen = rules.maxLength ?? (rules.max !== undefined ? rules.max : undefined)
        if (maxLen !== undefined && str.length > maxLen) {
          return isRTL ? `يجب ألا يتجاوز ${maxLen} حرفاً` : `Must not exceed ${maxLen} characters`
        }
        if (rules.pattern) {
          try {
            const regex = new RegExp(rules.pattern)
            if (!regex.test(str)) {
              return isRTL ? 'صيغة الإدخال غير مطابقة للشروط' : 'Input does not match required format'
            }
          } catch {
            return null
          }
        }
        if (rules.email) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailPattern.test(str)) {
            return isRTL ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address'
          }
        }
      } else if (fieldType === 'time') {
        const timeStr = String(val).trim()
        if (rules.format) {
          const upperFormat = rules.format.toUpperCase()
          if (upperFormat.includes('SS')) {
            const timeWithSecondsRegex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/
            const timeWithoutSecondsRegex = /^([01]\d|2[0-3]):[0-5]\d$/
            if (!timeWithSecondsRegex.test(timeStr) && !timeWithoutSecondsRegex.test(timeStr)) {
              return isRTL ? 'صيغة الوقت يجب أن تكون HH:MM:SS' : 'Time format must be HH:MM:SS'
            }
          } else if (upperFormat.includes('HH:MM')) {
            const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
            if (!timeRegex.test(timeStr)) {
              return isRTL ? 'صيغة الوقت يجب أن تكون HH:MM' : 'Time format must be HH:MM'
            }
          }
        }
      }
    }

    return null
  }

  const notifyAnswersChange = (updatedAnswers: Record<number, string | string[]>) => {
    if (!onAnswersChange) return
    const persistable: Record<number, string | string[]> = {}
    questions.forEach((q) => {
      const fieldType = getFieldType(q)
      if (fieldType !== 'file' && updatedAnswers[q.id] !== undefined) {
        persistable[q.id] = updatedAnswers[q.id]
      }
    })
    onAnswersChange(persistable)
  }

  const handleTextChange = (question: QuestionnaireQuestion | number, value: string) => {
    const q = typeof question === 'number' ? questions.find((item) => item.id === question) : question
    const qId = typeof question === 'number' ? question : question.id

    const next = { ...answers, [qId]: value }
    setAnswers(next)
    notifyAnswersChange(next)

    if (q) {
      const error = validateQuestion(q, value)
      setValidationErrors((prev) => {
        const nextErrors = { ...prev }
        if (error) {
          nextErrors[qId] = error
        } else {
          delete nextErrors[qId]
        }
        return nextErrors
      })
    }
  }

  const handleAddFiles = (question: QuestionnaireQuestion, newFiles: File[]) => {
    if (!newFiles || newFiles.length === 0) return
    const current = fileAnswers[question.id] || []
    const existingSignatures = new Set(
      current.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
    )
    const uniqueNew = newFiles.filter(
      (f) => !existingSignatures.has(`${f.name}-${f.size}-${f.lastModified}`)
    )
    const updated = [...current, ...uniqueNew]

    setFileAnswers((prev) => ({ ...prev, [question.id]: updated }))
    setAnswers((prev) => ({
      ...prev,
      [question.id]: updated.map((f) => f.name).join(', '),
    }))

    const error = validateQuestion(question, updated.length > 0 ? updated : null)
    setValidationErrors((prev) => {
      const nextErrors = { ...prev }
      if (error) {
        nextErrors[question.id] = error
      } else {
        delete nextErrors[question.id]
      }
      return nextErrors
    })
  }

  const handleRemoveFile = (question: QuestionnaireQuestion, indexToRemove: number) => {
    const current = fileAnswers[question.id] || []
    const updated = current.filter((_, idx) => idx !== indexToRemove)

    setFileAnswers((prev) => ({ ...prev, [question.id]: updated }))
    setAnswers((prev) => ({
      ...prev,
      [question.id]: updated.length > 0 ? updated.map((f) => f.name).join(', ') : '',
    }))

    const error = validateQuestion(question, updated.length > 0 ? updated : null)
    setValidationErrors((prev) => {
      const nextErrors = { ...prev }
      if (error) {
        nextErrors[question.id] = error
      } else {
        delete nextErrors[question.id]
      }
      return nextErrors
    })
  }

  const handleClearAllFiles = (question: QuestionnaireQuestion) => {
    setFileAnswers((prev) => ({ ...prev, [question.id]: [] }))
    setAnswers((prev) => ({ ...prev, [question.id]: '' }))

    const error = validateQuestion(question, null)
    setValidationErrors((prev) => {
      const nextErrors = { ...prev }
      if (error) {
        nextErrors[question.id] = error
      } else {
        delete nextErrors[question.id]
      }
      return nextErrors
    })
  }

  const handleToggleOption = (question: QuestionnaireQuestion, optionId: number) => {
    const idStr = String(optionId)
    const current = answers[question.id]
    let nextValue: string | string[]

    if (question.answer_type.allows_multiple) {
      const currentList = Array.isArray(current) ? current : []
      if (currentList.includes(idStr)) {
        nextValue = currentList.filter((item) => item !== idStr)
      } else {
        nextValue = [...currentList, idStr]
      }
    } else {
      nextValue = idStr
    }

    const next = { ...answers, [question.id]: nextValue }
    setAnswers(next)
    notifyAnswersChange(next)

    const error = validateQuestion(question, nextValue)
    setValidationErrors((prev) => {
      const nextErrors = { ...prev }
      if (error) {
        nextErrors[question.id] = error
      } else {
        delete nextErrors[question.id]
      }
      return nextErrors
    })
  }

  const handleRangeChange = (q: QuestionnaireQuestion | number, field: 'from' | 'to', value: string) => {
    const question = typeof q === 'number' ? questions.find((item) => item.id === q) : q
    const qId = typeof q === 'number' ? q : q.id

    const current = answers[qId]
    let parsed = { from: '', to: '' }
    if (typeof current === 'string' && current.startsWith('{')) {
      try {
        parsed = JSON.parse(current)
      } catch {
        parsed = { from: '', to: '' }
      }
    }
    const updatedRange = { ...parsed, [field]: value }
    const jsonStr = JSON.stringify(updatedRange)
    const next = {
      ...answers,
      [qId]: jsonStr,
    }
    setAnswers(next)
    notifyAnswersChange(next)

    if (question) {
      const error = validateQuestion(question, jsonStr)
      setValidationErrors((prev) => {
        const nextErrors = { ...prev }
        if (error) {
          nextErrors[qId] = error
        } else {
          delete nextErrors[qId]
        }
        return nextErrors
      })
    }
  }

  const handleGridSelect = (question: QuestionnaireQuestion, row: string, column: string) => {
    const current = getGridValue(question.id)
    const updated = { ...current, [row]: column }
    const jsonStr = JSON.stringify(updated)

    const next = { ...answers, [question.id]: jsonStr }
    setAnswers(next)
    notifyAnswersChange(next)

    const error = validateQuestion(question, jsonStr)
    setValidationErrors((prev) => {
      const nextErrors = { ...prev }
      if (error) {
        nextErrors[question.id] = error
      } else {
        delete nextErrors[question.id]
      }
      return nextErrors
    })
  }

  const isQuestionVisible = (q: QuestionnaireQuestion): boolean => {
    if (!q.conditions || q.conditions.length === 0) {
      return true
    }

    let isMatch = true
    for (let i = 0; i < q.conditions.length; i++) {
      const cond = q.conditions[i]
      const targetAnswer = answers[cond.depends_on_question_id]
      const expectedVal = cond.value != null ? String(cond.value).trim() : ''
      const optionId = cond.question_option_id != null ? String(cond.question_option_id) : ''

      let singleCondResult = false

      if (targetAnswer !== undefined && targetAnswer !== null && targetAnswer !== '') {
        const matchesValue = (ans: string) => {
          const trimmed = String(ans).trim()
          if (expectedVal === '1' && (trimmed === '1' || trimmed === 'نعم' || trimmed.toLowerCase() === 'true')) {
            return true
          }
          if (expectedVal === '0' && (trimmed === '0' || trimmed === 'لا' || trimmed.toLowerCase() === 'false')) {
            return true
          }
          if (expectedVal && trimmed === expectedVal) {
            return true
          }
          if (optionId && trimmed === optionId) {
            return true
          }
          const depQuestion = questions.find((item) => item.id === cond.depends_on_question_id)
          if (depQuestion?.options) {
            const foundOpt = depQuestion.options.find(
              (o) => String(o.id) === trimmed || (o.title || o.name || o.label || o.value) === trimmed
            )
            if (foundOpt) {
              if (optionId && String(foundOpt.id) === optionId) return true
              if (
                expectedVal &&
                (String(foundOpt.id) === expectedVal ||
                  (foundOpt.title || foundOpt.name || foundOpt.label || foundOpt.value) === expectedVal)
              ) {
                return true
              }
            }
          }
          return false
        }

        let isTargetMatching = false
        if (Array.isArray(targetAnswer)) {
          isTargetMatching = targetAnswer.some(matchesValue)
        } else {
          isTargetMatching = matchesValue(String(targetAnswer))
        }

        if (cond.operator === 'equals' || cond.operator === '=') {
          singleCondResult = isTargetMatching
        } else if (cond.operator === 'not_equals' || cond.operator === '!=') {
          singleCondResult = !isTargetMatching
        } else {
          singleCondResult = isTargetMatching
        }
      } else {
        if (cond.operator === 'not_equals' || cond.operator === '!=') {
          singleCondResult = true
        } else {
          singleCondResult = false
        }
      }

      if (i === 0) {
        isMatch = singleCondResult
      } else {
        if (cond.logic_type === 'OR') {
          isMatch = isMatch || singleCondResult
        } else {
          isMatch = isMatch && singleCondResult
        }
      }
    }

    return isMatch
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const errors: Record<number, string> = {}
    questions.forEach((q) => {
      if (isQuestionVisible(q)) {
        const err = validateQuestion(q, answers[q.id])
        if (err) {
          errors[q.id] = err
        }
      }
    })

    const cqErrors: Record<string, string> = {}
    customQuestions.forEach((item) => {
      const hasQ = Boolean(item.question.trim())
      const hasA = Boolean(item.answer.trim())
      const hasN = Boolean(item.notes.trim())
      if (!hasQ && (hasA || hasN)) {
        cqErrors[`q_${item.id}`] = isRTL ? 'يرجى إدخال نص السؤال' : 'Please enter the question text'
      }
    })

    if (Object.keys(errors).length > 0 || Object.keys(cqErrors).length > 0) {
      setValidationErrors(errors)
      setCustomQuestionErrors(cqErrors)
      if (Object.keys(errors).length > 0) {
        const firstErrorQuestionId = Object.keys(errors)[0]
        const el = document.getElementById(`question-${firstErrorQuestionId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } else {
        const firstCqErrorKey = Object.keys(cqErrors)[0]
        const el = document.getElementById(`custom-field-${firstCqErrorKey}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    setCustomQuestionErrors({})
    setIsSubmitting(true)

    const formattedAnswers: Record<string, QuestionnaireAnswerValue> = {}

    questions.forEach((q) => {
      if (isQuestionVisible(q)) {
        const val = answers[q.id]
        const fieldType = getFieldType(q)
        const rules = parseValidationRules(q.validation_rules)

        if (q.options && q.options.length > 0) {
          if (q.answer_type.allows_multiple) {
            const list = Array.isArray(val) ? val : val !== undefined && val !== null && val !== '' ? [val] : []
            const idList = list
              .map((item) => {
                const found = q.options?.find(
                  (opt) => String(opt.id) === String(item) || (opt.title || opt.name || opt.label || opt.value) === item
                )
                return found ? found.id : Number(item) || item
              })
              .filter((id) => id !== undefined && id !== null && id !== '')
            if (idList.length > 0) {
              formattedAnswers[String(q.id)] = idList
            }
          } else {
            const singleVal = Array.isArray(val) ? val[0] : val
            if (singleVal !== undefined && singleVal !== null && singleVal !== '') {
              const found = q.options.find(
                (opt) => String(opt.id) === String(singleVal) || (opt.title || opt.name || opt.label || opt.value) === singleVal
              )
              if (found) {
                formattedAnswers[String(q.id)] = found.id
              } else {
                const numId = Number(singleVal)
                formattedAnswers[String(q.id)] = isNaN(numId) ? singleVal : numId
              }
            }
          }
        } else if (fieldType === 'grid') {
          const grid = getGridValue(q.id)
          const hasValues = Object.values(grid).some(Boolean)
          if (hasValues) {
            formattedAnswers[String(q.id)] = grid
          }
        } else if (fieldType === 'duration') {
          const range = getRangeValue(q.id)
          if (range.from || range.to) {
            formattedAnswers[String(q.id)] = `من: ${range.from || '—'} إلى: ${range.to || '—'}`
          } else if (val !== undefined && val !== null && val !== '') {
            formattedAnswers[String(q.id)] = String(val)
          }
        } else if (fieldType === 'time') {
          if (val !== undefined && val !== null && val !== '') {
            let timeStr = String(val).trim()
            if (rules.format?.toUpperCase().includes('SS')) {
              if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
                timeStr = `${timeStr.padStart(5, '0')}:00`
              } else if (/^\d{1}:\d{2}:\d{2}$/.test(timeStr)) {
                timeStr = `0${timeStr}`
              }
            } else if (rules.format?.toUpperCase() === 'HH:MM') {
              if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) {
                timeStr = timeStr.slice(0, 5)
              }
              if (/^\d{1}:\d{2}$/.test(timeStr)) {
                timeStr = `0${timeStr}`
              }
            }
            formattedAnswers[String(q.id)] = timeStr
          }
        } else if (fieldType === 'file') {
          const files = fileAnswers[q.id]
          if (files && files.length > 0) {
            formattedAnswers[String(q.id)] = files
          }
        } else if (fieldType === 'yes_no') {
          if (val !== undefined && val !== null && val !== '') {
            formattedAnswers[String(q.id)] = val === '1' || val === 'نعم' ? 1 : 0
          }
        } else if (fieldType === 'number' || fieldType === 'linear_scale') {
          if (val !== undefined && val !== null && val !== '') {
            const num = Number(val)
            formattedAnswers[String(q.id)] = isNaN(num) ? String(val) : num
          }
        } else if (fieldType === 'rating') {
          if (val !== undefined && val !== null && val !== '') {
            formattedAnswers[String(q.id)] = Number(val) || 0
          }
        } else if (Array.isArray(val)) {
          if (val.length > 0) {
            formattedAnswers[String(q.id)] = val.join(', ')
          }
        } else if (val !== undefined && val !== null && val !== '') {
          formattedAnswers[String(q.id)] = String(val)
        }
      }
    })

    const validAdditionalQuestions: AdditionalQuestionItem[] = customQuestions
      .filter((item) => item.question.trim() !== '')
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim() ? item.answer.trim() : null,
        notes: item.notes.trim() ? item.notes.trim() : null,
      }))

    try {
      if (onFinish) {
        await onFinish(formattedAnswers, validAdditionalQuestions)
      } else {
        setSubmitted(true)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError(isRTL ? 'حدث خطأ أثناء حفظ الإجابات' : 'An error occurred while saving answers')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const sectionsMap = new Map<string, QuestionnaireQuestion[]>()
  questions.forEach((q) => {
    const sectionName = q.section?.name || (isRTL ? 'الأسئلة العامة' : 'General Questions')
    if (!sectionsMap.has(sectionName)) {
      sectionsMap.set(sectionName, [])
    }
    sectionsMap.get(sectionName)?.push(q)
  })

  return (
    <section className="flex-1 pb-16">
      <div className="max-w-[920px] mx-auto">
        <div className="mb-12">
          <h2
            className="text-white m-0 font-extrabold font-display"
            style={{ fontSize: 'clamp(28px,3.5vw,50px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            <span>{isRTL ? 'استبيان المشروع: ' : 'QUESTIONNAIRE: '}</span>
            <span className="text-[#C5A059]">{projectName || (projectId ? `#${encodeProjectId(projectId)}` : '')}</span>
          </h2>
        </div>

        {submitted ? (
          <div className="p-8 bg-[#0b0b0b] border border-[#C5A059]/40 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#C5A059]/15 border border-[#C5A059] flex items-center justify-center text-[#C5A059] mb-4">
              <CheckIcon className="w-6 h-6" />
            </div>
            <h3 className="text-white text-xl font-bold font-display mb-2">
              {isRTL ? 'تم حفظ إجابات الاستبيان بنجاح' : 'Questionnaire Answers Saved'}
            </h3>
            <p className="text-white/50 text-sm font-display mb-6">
              {isRTL
                ? 'شكراً لك، تم تسجيل كافة التفاصيل الخاصة بالمشروع بنجاح.'
                : 'Thank you, all project details have been successfully recorded.'}
            </p>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-xs tracking-wider font-display hover:border-[#C5A059] transition-colors cursor-pointer"
              >
                {isRTL ? 'بدء مشروع جديد' : 'Start New Project'}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-12">
            {Array.from(sectionsMap.entries()).map(([sectionName, sectionQuestions]) => {
              const visibleQuestions = sectionQuestions.filter(isQuestionVisible)
              if (visibleQuestions.length === 0) {
                return null
              }

              return (
                <div
                  key={sectionName}
                  className="bg-[#0b0b0b]/60 border border-white/[0.08] p-6 sm:p-8 space-y-8"
                >
                  <div className="border-b border-white/[0.08] pb-4">
                    <h3 className="text-[#C5A059] text-base font-bold font-display">
                      {sectionName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 items-start">
                    {visibleQuestions.map((q) => {
                      const fieldType = getFieldType(q)
                      const parsedRules = parseValidationRules(q.validation_rules)
                      const isRequired = q.is_required || parsedRules.required
                      const hasError = Boolean(validationErrors[q.id])
                      const isHalfWidth = isHalfWidthQuestion(q)

                      return (
                        <div
                          key={q.id}
                          id={`question-${q.id}`}
                          className={`space-y-3 ${isHalfWidth ? 'col-span-1' : 'md:col-span-2'}`}
                        >
                          <div className="block">
                            <span className="block text-white/85 text-[13px] tracking-[0.05em] font-medium font-display mb-1.5">
                              {q.title}
                              {isRequired && <span className="text-[#C5A059] mr-1">*</span>}
                            </span>
                            {q.description && (
                              <span className="block text-white/40 text-xs font-light leading-relaxed mb-3">
                                {q.description}
                              </span>
                            )}

                            {fieldType === 'rating' && (
                              <div className="flex items-center gap-3 pt-2">
                                <div className="flex items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((starIndex) => {
                                    const currentRating = Number(answers[q.id]) || 0
                                    const hoverRating = hoveredStars[q.id] || 0
                                    const isFilled = hoverRating > 0 ? starIndex <= hoverRating : starIndex <= currentRating

                                    return (
                                      <button
                                        key={starIndex}
                                        type="button"
                                        onClick={() => handleTextChange(q.id, String(starIndex))}
                                        onMouseEnter={() =>
                                          setHoveredStars((prev) => ({ ...prev, [q.id]: starIndex }))
                                        }
                                        onMouseLeave={() =>
                                          setHoveredStars((prev) => ({ ...prev, [q.id]: 0 }))
                                        }
                                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                                      >
                                        <StarIcon
                                          filled={isFilled}
                                          className={`w-7 h-7 transition-colors ${isFilled ? 'text-[#C5A059]' : 'text-white/20'
                                            }`}
                                        />
                                      </button>
                                    )
                                  })}
                                </div>
                                <span className="text-xs text-white/40 font-display">
                                  {answers[q.id]
                                    ? `${answers[q.id]} / 5 ${isRTL ? 'نجوم' : 'Stars'}`
                                    : isRTL
                                      ? 'حدد التقييم'
                                      : 'Select rating'}
                                </span>
                              </div>
                            )}

                            {fieldType === 'yes_no' && (
                              <div className="flex gap-4 pt-2">
                                {['نعم', 'لا'].map((choice) => {
                                  const isSelected =
                                    answers[q.id] === choice ||
                                    (choice === 'نعم' && answers[q.id] === '1') ||
                                    (choice === 'لا' && answers[q.id] === '0')
                                  return (
                                    <button
                                      key={choice}
                                      type="button"
                                      onClick={() => handleTextChange(q.id, choice === 'نعم' ? '1' : '0')}
                                      className={`px-8 py-3 border font-display text-sm tracking-wider transition-all cursor-pointer ${isSelected
                                          ? 'border-[#C5A059] bg-[#C5A059]/20 text-[#C5A059]'
                                          : hasError
                                            ? 'border-red-500/50 bg-[#0a0a0a] text-white/70 hover:border-red-500'
                                            : 'border-white/15 bg-[#0a0a0a] text-white/70 hover:border-white/40'
                                        }`}
                                    >
                                      {choice}
                                    </button>
                                  )
                                })}
                              </div>
                            )}

                            {fieldType === 'duration' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                  <span className="block text-white/50 text-[11px] mb-2 font-display">
                                    {isRTL ? 'من (تاريخ ووقت البدء):' : 'From (Start Date & Time):'}
                                  </span>
                                  <input
                                    type="datetime-local"
                                    required={isRequired}
                                    value={getRangeValue(q.id).from}
                                    onChange={(e) => handleRangeChange(q.id, 'from', e.target.value)}
                                    className={`w-full bg-[#0a0a0a] border outline-none text-white px-3.5 py-2.5 text-sm font-display [color-scheme:dark] transition-colors ${hasError ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                                      }`}
                                  />
                                </div>
                                <div>
                                  <span className="block text-white/50 text-[11px] mb-2 font-display">
                                    {isRTL ? 'إلى (تاريخ ووقت الانتهاء):' : 'To (End Date & Time):'}
                                  </span>
                                  <input
                                    type="datetime-local"
                                    required={isRequired}
                                    value={getRangeValue(q.id).to}
                                    onChange={(e) => handleRangeChange(q.id, 'to', e.target.value)}
                                    className={`w-full bg-[#0a0a0a] border outline-none text-white px-3.5 py-2.5 text-sm font-display [color-scheme:dark] transition-colors ${hasError ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                                      }`}
                                  />
                                </div>
                              </div>
                            )}

                            {fieldType === 'date' && (
                              <div className="pt-2 w-full">
                                <input
                                  type="date"
                                  required={isRequired}
                                  min={parsedRules.min ? String(parsedRules.min) : undefined}
                                  max={parsedRules.max ? String(parsedRules.max) : undefined}
                                  value={(answers[q.id] as string) || ''}
                                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                                  className={`w-full bg-[#0a0a0a] border outline-none text-white px-3.5 py-2.5 text-sm font-display [color-scheme:dark] transition-colors ${hasError ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                                    }`}
                                />
                              </div>
                            )}

                            {fieldType === 'time' && (
                              <div className="pt-2 w-full">
                                <input
                                  type="time"
                                  required={isRequired}
                                  step={
                                    parsedRules.format?.toUpperCase().includes('SS')
                                      ? '1'
                                      : parsedRules.step
                                        ? String(parsedRules.step)
                                        : undefined
                                  }
                                  min={parsedRules.min ? String(parsedRules.min) : undefined}
                                  max={parsedRules.max ? String(parsedRules.max) : undefined}
                                  value={(answers[q.id] as string) || ''}
                                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                                  className={`w-full bg-[#0a0a0a] border outline-none text-white px-3.5 py-2.5 text-sm font-display [color-scheme:dark] transition-colors ${hasError ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                                    }`}
                                />
                              </div>
                            )}

                            {fieldType === 'number' && (
                              <input
                                type="number"
                                required={isRequired}
                                min={parsedRules.min}
                                max={parsedRules.max}
                                step={parsedRules.step ?? 'any'}
                                placeholder={q.placeholder || (isRTL ? 'أدخل رقماً...' : 'Enter a number...')}
                                value={(answers[q.id] as string) || ''}
                                onChange={(e) => handleTextChange(q.id, e.target.value)}
                                className={`w-full bg-transparent border-0 border-b outline-none text-white/90 pb-2 transition-colors placeholder:text-white/20 font-display text-[15px] ${hasError ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                                  }`}
                              />
                            )}

                            {fieldType === 'linear_scale' && (
                              <input
                                type="number"
                                min={1}
                                max={5}
                                required={isRequired}
                                placeholder={q.placeholder || (isRTL ? 'أدخل رقماً بين 1 و 5...' : 'Enter a number between 1 and 5...')}
                                value={(answers[q.id] as string) || ''}
                                onChange={(e) => handleTextChange(q, e.target.value)}
                                className={`w-full bg-transparent border-0 border-b outline-none text-white/90 pb-2 transition-colors placeholder:text-white/20 font-display text-[15px] ${hasError ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                                  }`}
                              />
                            )}

                            {fieldType === 'paragraph' && (
                              <textarea
                                rows={4}
                                required={isRequired}
                                minLength={parsedRules.minLength ?? parsedRules.min}
                                maxLength={parsedRules.maxLength ?? parsedRules.max}
                                placeholder={q.placeholder || (isRTL ? 'أدخل الفقرة النصية هنا...' : 'Enter paragraph text here...')}
                                value={(answers[q.id] as string) || ''}
                                onChange={(e) => handleTextChange(q.id, e.target.value)}
                                className={`w-full resize-none bg-[#0a0a0a] border outline-none text-white/90 p-3.5 placeholder:text-white/20 transition-colors font-light text-[14px] leading-[1.8] font-display ${hasError ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                                  }`}
                              />
                            )}

                            {fieldType === 'options' && (
                              <div className="flex flex-wrap gap-2.5 pt-2">
                                {q.options?.map((opt) => {
                                  const optLabel =
                                    opt.title || opt.name || opt.label || opt.value || ''
                                  const optIdStr = String(opt.id)
                                  const currentAnswer = answers[q.id]
                                  const isSelected = q.answer_type.allows_multiple
                                    ? Array.isArray(currentAnswer) &&
                                    (currentAnswer.includes(optIdStr) || currentAnswer.includes(optLabel))
                                    : currentAnswer === optIdStr || currentAnswer === optLabel

                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => handleToggleOption(q, opt.id)}
                                      className={`px-4 py-2 border text-xs tracking-wider font-display transition-all cursor-pointer ${isSelected
                                          ? 'border-[#C5A059] bg-[#C5A059]/20 text-[#C5A059]'
                                          : hasError
                                            ? 'border-red-500/50 bg-[#0a0a0a] text-white/70 hover:border-red-500'
                                            : 'border-white/15 bg-[#0a0a0a] text-white/70 hover:border-white/40'
                                        }`}
                                    >
                                      {optLabel}
                                    </button>
                                  )
                                })}
                              </div>
                            )}

                            {fieldType === 'grid' && (
                              <div className="pt-2 overflow-x-auto">
                                {parsedRules.rows && parsedRules.columns && parsedRules.rows.length > 0 && parsedRules.columns.length > 0 ? (
                                  <div
                                    className={`border transition-colors ${hasError ? 'border-red-500/60 bg-red-950/10' : 'border-white/10 bg-[#0e0e0e]/80'
                                      }`}
                                  >
                                    <table className="w-full border-collapse text-sm">
                                      <thead>
                                        <tr className="border-b border-white/10 bg-white/[0.02]">
                                          <th
                                            className={`p-3.5 sm:p-4 text-xs font-semibold text-white/40 font-display ${isRTL ? 'text-right' : 'text-left'
                                              }`}
                                          >
                                            {isRTL ? 'العنصر' : 'Item'}
                                          </th>
                                          {parsedRules.columns.map((col) => (
                                            <th
                                              key={col}
                                              className="p-3.5 sm:p-4 text-xs font-semibold text-center text-[#C5A059] font-display tracking-wider whitespace-nowrap"
                                            >
                                              {col}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/[0.06]">
                                        {parsedRules.rows.map((row) => {
                                          const currentGrid = getGridValue(q.id)
                                          const selectedCol = currentGrid[row]
                                          return (
                                            <tr key={row} className="hover:bg-white/[0.02] transition-colors">
                                              <td
                                                className={`p-3.5 sm:p-4 text-white/90 font-display font-medium text-xs sm:text-sm ${isRTL ? 'text-right' : 'text-left'
                                                  }`}
                                              >
                                                {row}
                                              </td>
                                              {parsedRules.columns!.map((col) => {
                                                const isSelected = selectedCol === col
                                                return (
                                                  <td
                                                    key={col}
                                                    onClick={() => handleGridSelect(q, row, col)}
                                                    className={`p-3 text-center cursor-pointer transition-colors ${isSelected ? 'bg-[#C5A059]/10' : 'hover:bg-white/[0.03]'
                                                      }`}
                                                  >
                                                    <div className="flex items-center justify-center">
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          handleGridSelect(q, row, col)
                                                        }}
                                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${isSelected
                                                            ? 'border-[#C5A059] bg-[#C5A059]/20 shadow-[0_0_8px_rgba(197,160,89,0.3)]'
                                                            : 'border-white/25 bg-transparent hover:border-white/50'
                                                          }`}
                                                        aria-label={`${row}: ${col}`}
                                                      >
                                                        {isSelected && (
                                                          <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                                                        )}
                                                      </button>
                                                    </div>
                                                  </td>
                                                )
                                              })}
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="p-4 border border-white/10 text-white/40 text-xs font-display">
                                    {isRTL ? 'لا توجد خيارات متاحة لهذه الشبكة' : 'No options available for this grid'}
                                  </div>
                                )}
                              </div>
                            )}

                            {fieldType === 'file' && (
                              <div className="pt-2 space-y-3">
                                <label
                                  htmlFor={`file-input-${q.id}`}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault()
                                    const fileList = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []
                                    handleAddFiles(q, fileList)
                                  }}
                                  className={`relative border border-dashed transition-all cursor-pointer p-6 sm:p-8 flex flex-col items-center justify-center text-center block ${hasError
                                      ? 'border-red-500/60 bg-red-500/5 hover:border-red-500'
                                      : 'border-white/20 bg-[#0a0a0a] hover:border-[#C5A059]/60 hover:bg-white/[0.02]'
                                    }`}
                                >
                                  <input
                                    id={`file-input-${q.id}`}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    accept={
                                      parsedRules.pattern ||
                                      'image/jpeg,image/png,image/webp,image/jpg,application/pdf,.jpg,.jpeg,.png,.webp,.pdf'
                                    }
                                    onChange={(e) => {
                                      const fileList = e.target.files ? Array.from(e.target.files) : []
                                      handleAddFiles(q, fileList)
                                      e.target.value = ''
                                    }}
                                  />

                                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-white/5 text-white/40 flex items-center justify-center">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-5 h-5"
                                      >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                      </svg>
                                    </div>
                                    <span className="text-white/80 text-sm font-display">
                                      {isRTL ? 'انقر لرفع ملفات أو اسحب الملفات هنا' : 'Click to upload or drag and drop'}
                                    </span>
                                    <span className="text-white/35 text-[11px] font-display">
                                      {isRTL
                                        ? 'JPG, PNG, WEBP, PDF (الحد الأقصى: 10 ميغابايت لكل ملف)'
                                        : 'JPG, PNG, WEBP, PDF (Max: 10MB per file)'}
                                    </span>
                                    <span className="text-[#C5A059]/75 text-[10px] font-display">
                                      {isRTL
                                        ? 'يرجى إعادة اختيار المرفقات بعد تحديث الصفحة'
                                        : 'Please re-select attachments after page refresh'}
                                    </span>
                                  </div>
                                </label>

                                {fileAnswers[q.id] && fileAnswers[q.id].length > 0 && (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between px-1">
                                      <span className="text-white/60 text-xs font-display">
                                        {isRTL
                                          ? `الملفات المحددة (${fileAnswers[q.id].length})`
                                          : `Selected files (${fileAnswers[q.id].length})`}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleClearAllFiles(q)}
                                        className="text-xs text-red-400 hover:text-red-300 font-display transition-colors cursor-pointer"
                                      >
                                        {isRTL ? 'إزالة الكل' : 'Clear all'}
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {fileAnswers[q.id].map((file, idx) => {
                                        const isImg =
                                          file.type.startsWith('image/') ||
                                          /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name)
                                        const sizeFormatted =
                                          file.size > 1024 * 1024
                                            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                            : `${Math.round(file.size / 1024)} KB`

                                        return (
                                          <div
                                            key={`${file.name}-${idx}`}
                                            className="flex items-center justify-between p-2.5 bg-[#0e0e0e] border border-white/10 hover:border-white/20 transition-colors"
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <span
                                                className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${isImg
                                                    ? 'bg-[#C5A059]/20 text-[#C5A059]'
                                                    : 'bg-blue-500/20 text-blue-300'
                                                  }`}
                                              >
                                                {isImg ? 'IMG' : 'PDF'}
                                              </span>
                                              <div className="min-w-0">
                                                <p className="text-white/90 text-xs font-display truncate">
                                                  {file.name}
                                                </p>
                                                <p className="text-white/35 text-[10px] font-display">
                                                  {sizeFormatted}
                                                </p>
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveFile(q, idx)}
                                              className="text-white/30 hover:text-red-400 p-1 transition-colors cursor-pointer shrink-0 mr-1"
                                              aria-label={isRTL ? 'إزالة الملف' : 'Remove file'}
                                            >
                                              <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="w-4 h-4"
                                              >
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                              </svg>
                                            </button>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {fieldType === 'short_text' && (
                              <input
                                type="text"
                                required={isRequired}
                                minLength={parsedRules.minLength ?? parsedRules.min}
                                maxLength={parsedRules.maxLength ?? parsedRules.max}
                                pattern={parsedRules.pattern}
                                placeholder={q.placeholder || (isRTL ? 'أدخل الإجابة هنا...' : 'Enter answer here...')}
                                value={(answers[q.id] as string) || ''}
                                onChange={(e) => handleTextChange(q.id, e.target.value)}
                                className={`w-full bg-transparent border-0 border-b outline-none text-white/90 pb-2 transition-colors placeholder:text-white/20 font-display text-[15px] ${hasError ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                                  }`}
                              />
                            )}
                          </div>

                          {hasError && (
                            <p className="text-xs font-display text-red-400 mt-1">
                              {validationErrors[q.id]}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div className="bg-[#0b0b0b]/60 border border-white/[0.08] p-6 sm:p-8 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <h3 className="text-[#C5A059] text-base font-bold font-display uppercase tracking-wide">
                  {isRTL ? 'الأسئلة الإضافية' : 'ADDITIONAL QUESTIONS'}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-white text-sm sm:text-base font-bold font-display">
                      {isRTL ? 'إضافة سؤال وجواب مخصص' : 'Custom Question & Answer'}
                    </h4>
                    <p className="text-white/45 text-xs font-display leading-relaxed mt-1">
                      {isRTL
                        ? 'يمكنك إضافة سؤال وجواب بنص حر إذا كان لديك تفاصيل إضافية غير مذكورة في الاستبيان'
                        : 'You can add custom questions and answers with free text if you have details not covered in the survey'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomQuestion}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5A059]/10 border border-[#C5A059]/40 hover:bg-[#C5A059]/20 text-[#C5A059] text-xs font-bold font-display transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>{isRTL ? 'إضافة سؤال وجواب' : 'Add Question & Answer'}</span>
                  </button>
                </div>

                {customQuestions.length > 0 && (
                  <div className="space-y-4">
                    {customQuestions.map((cq, idx) => (
                      <div
                        key={cq.id}
                        className="p-5 bg-[#0e0e0e] border border-white/10 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[#C5A059] text-xs font-bold font-display">
                            {isRTL ? `سؤال إضافي #${idx + 1}` : `Custom Question #${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomQuestion(cq.id)}
                            className="text-white/30 hover:text-red-400 p-1 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            aria-label={isRTL ? 'حذف السؤال' : 'Remove question'}
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            <span className="font-display">{isRTL ? 'حذف' : 'Remove'}</span>
                          </button>
                        </div>

                        <div id={`custom-field-q_${cq.id}`} className="space-y-2">
                          <label className="text-white/80 text-xs font-bold font-display block">
                            {isRTL ? 'السؤال' : 'Question'}
                          </label>
                          <input
                            type="text"
                            value={cq.question}
                            onChange={(e) => handleUpdateCustomQuestion(cq.id, 'question', e.target.value)}
                            placeholder={isRTL ? 'أدخل نص السؤال هنا...' : 'Enter question text here...'}
                            className={`w-full bg-transparent border-0 border-b outline-none text-white/90 pb-2 transition-colors placeholder:text-white/20 font-display text-[15px] ${
                              customQuestionErrors[`q_${cq.id}`] ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                            }`}
                          />
                          {customQuestionErrors[`q_${cq.id}`] && (
                            <p className="text-xs font-display text-red-400 mt-1">
                              {customQuestionErrors[`q_${cq.id}`]}
                            </p>
                          )}
                        </div>

                        <div id={`custom-field-a_${cq.id}`} className="space-y-2">
                          <label className="text-white/80 text-xs font-bold font-display block">
                            {isRTL ? 'الإجابة' : 'Answer'}
                          </label>
                          <textarea
                            rows={2}
                            value={cq.answer}
                            onChange={(e) => handleUpdateCustomQuestion(cq.id, 'answer', e.target.value)}
                            placeholder={isRTL ? 'أدخل نص الإجابة هنا...' : 'Enter answer text here...'}
                            className={`w-full bg-[#111111]/40 border p-3 text-white/90 outline-none transition-colors placeholder:text-white/20 font-display text-sm resize-y ${
                              customQuestionErrors[`a_${cq.id}`] ? 'border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                            }`}
                          />
                          {customQuestionErrors[`a_${cq.id}`] && (
                            <p className="text-xs font-display text-red-400 mt-1">
                              {customQuestionErrors[`a_${cq.id}`]}
                            </p>
                          )}
                        </div>

                        <div id={`custom-field-n_${cq.id}`} className="space-y-2">
                          <label className="text-white/80 text-xs font-bold font-display block">
                            {isRTL ? 'الملاحظة' : 'Note'}
                          </label>
                          <textarea
                            rows={2}
                            value={cq.notes}
                            onChange={(e) => handleUpdateCustomQuestion(cq.id, 'notes', e.target.value)}
                            placeholder={isRTL ? 'أدخل نص الملاحظة هنا...' : 'Enter note text here...'}
                            className="w-full bg-[#111111]/40 border border-white/15 focus:border-[#C5A059] p-3 text-white/90 outline-none transition-colors placeholder:text-white/20 font-display text-sm resize-y"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {submitError && (
              <div className="p-4 mb-6 border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-display">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end pt-6 border-t border-white/[0.08]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group ms-auto inline-flex items-center gap-5 bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50"
              >
                <span
                  className="font-bold transition-colors font-display text-white group-hover:text-[#C5A059]"
                  style={{ fontSize: 'clamp(18px,2vw,26px)', lineHeight: 1 }}
                >
                  {isSubmitting
                    ? (isRTL ? 'جاري الحفظ...' : 'SUBMITTING...')
                    : (isRTL ? 'اعتماد وحفظ إجابات الاستبيان' : 'SUBMIT QUESTIONNAIRE')}
                </span>
                <div className="w-10 sm:w-16 h-px transition-colors bg-[#C5A059]" />
                <ArrowUpRightIcon
                  className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 text-[#C5A059] ${isRTL ? 'scale-x-[-1]' : ''}`}
                />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
