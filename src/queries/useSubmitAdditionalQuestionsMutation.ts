import { useMutation } from '@tanstack/react-query'
import { submitAdditionalQuestions } from '../api/questionnaireApi'
import type {
  AdditionalQuestionItem,
  SubmitAdditionalQuestionsResponse,
} from '../types/questionnaire.types'

interface SubmitAdditionalQuestionsVariables {
  projectId: number
  additionalQuestions: AdditionalQuestionItem[]
}

export function useSubmitAdditionalQuestionsMutation() {
  return useMutation<SubmitAdditionalQuestionsResponse, Error, SubmitAdditionalQuestionsVariables>({
    mutationFn: ({ projectId, additionalQuestions }: SubmitAdditionalQuestionsVariables) =>
      submitAdditionalQuestions(projectId, additionalQuestions),
  })
}
