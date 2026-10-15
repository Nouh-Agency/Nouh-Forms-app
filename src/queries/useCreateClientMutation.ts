import { useMutation } from '@tanstack/react-query'
import { createClient, type CreateClientPayload, type ClientResponse } from '../api/clientsApi'

export function useCreateClientMutation() {
  return useMutation<ClientResponse, Error, CreateClientPayload>({
    mutationFn: createClient,
  })
}
