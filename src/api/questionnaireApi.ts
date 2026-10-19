import { apiClient } from './apiClient'
import type {
  QuestionnaireQuestion,
  QuestionnaireResponse,
  QuestionnaireAnswerValue,
  SubmitQuestionnaireAnswersResponse,
  AdditionalQuestionItem,
  SubmitAdditionalQuestionsResponse,
} from '../types/questionnaire.types'

export async function fetchProjectQuestionnaire(projectId: number): Promise<QuestionnaireQuestion[]> {
  const response = await apiClient.get<QuestionnaireQuestion[] | QuestionnaireResponse>(
    `/api/projects/${projectId}/questionnaire`
  )
  if ('data' in response.data && Array.isArray(response.data.data)) {
    return response.data.data
  }
  if (Array.isArray(response.data)) {
    return response.data
  }
  return []
}

export async function submitQuestionnaireAnswers(
  projectId: number,
  answers: Record<string, QuestionnaireAnswerValue>
): Promise<SubmitQuestionnaireAnswersResponse> {
  const formData = new FormData()

  Object.entries(answers).forEach(([key, val]) => {
    if (val === undefined || val === null || val === '') {
      return
    }

    if (val instanceof File) {
      formData.append(`answers[${key}][0]`, val)
    } else if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`answers[${key}][${index}]`, item)
        } else if (item !== undefined && item !== null && item !== '') {
          formData.append(`answers[${key}][${index}]`, String(item))
        }
      })
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([subKey, subVal]) => {
        if (subVal !== undefined && subVal !== null && subVal !== '') {
          formData.append(`answers[${key}][${subKey}]`, String(subVal))
        }
      })
    } else {
      formData.append(`answers[${key}]`, String(val))
    }
  })

  if (typeof answers.additional_notes === 'string' && answers.additional_notes.trim()) {
    formData.append('notes', answers.additional_notes.trim())
  }

  const response = await apiClient.post<SubmitQuestionnaireAnswersResponse>(
    `/api/projects/${projectId}/answers`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

export async function submitAdditionalQuestions(
  projectId: number,
  additionalQuestions: AdditionalQuestionItem[]
): Promise<SubmitAdditionalQuestionsResponse> {
  const response = await apiClient.patch<SubmitAdditionalQuestionsResponse>(
    `/api/projects/${projectId}/additional-questions`,
    {
      additional_questions: additionalQuestions,
    }
  )
  return response.data
}

