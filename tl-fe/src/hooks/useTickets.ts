import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTickets, createTicket, resolveTicket } from '../api/tickets'
import type { TicketCreate } from '../schemas/ticket'

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticket: TicketCreate) => createTicket(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useResolveTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resolveTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
