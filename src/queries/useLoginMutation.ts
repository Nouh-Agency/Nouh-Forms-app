import { useMutation } from '@tanstack/react-query'
import { loginUser, type LoginPayload, type LoginResponse } from '../api/authApi'

export function useLoginMutation() {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginUser,
  })
}
