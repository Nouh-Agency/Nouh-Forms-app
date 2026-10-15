import { useMutation } from '@tanstack/react-query'
import { submitQuestionnaireAnswers } from '../api/questionnaireApi'
import type {
  QuestionnaireAnswerValue,
  SubmitQuestionnaireAnswersResponse,
} from '../types/questionnaire.types'

interface SubmitVariables {
  projectId: number
  answers: Record<string, QuestionnaireAnswerValue>
}

export function useSubmitQuestionnaireAnswersMutation() {
  return useMutation<SubmitQuestionnaireAnswersResponse, Error, SubmitVariables>({
    mutationFn: ({ projectId, answers }: SubmitVariables) =>
      submitQuestionnaireAnswers(projectId, answers),
  })
}
