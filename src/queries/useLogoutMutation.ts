import { useMutation } from '@tanstack/react-query'
import { logoutUser, type LogoutResponse } from '../api/authApi'

export function useLogoutMutation() {
  return useMutation<LogoutResponse, Error, void>({
    mutationFn: logoutUser,
  })
}
