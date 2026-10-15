import { useMutation } from '@tanstack/react-query'
import { createProject } from '../api/projectsApi'
import type { CreateProjectPayload, ProjectResponse } from '../types/project.types'

export function useCreateProjectMutation() {
  return useMutation<ProjectResponse, Error, CreateProjectPayload>({
    mutationFn: createProject,
  })
}
