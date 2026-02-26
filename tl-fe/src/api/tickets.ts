import api from './axios'
import type { TicketCreate, TicketResponse } from '../schemas/ticket'

export async function getTickets(): Promise<TicketResponse[]> {
  const { data } = await api.get<TicketResponse[]>('/tickets')
  return data
}

export async function createTicket(ticket: TicketCreate): Promise<TicketResponse> {
  const { data } = await api.post<TicketResponse>('/tickets', ticket)
  return data
}

export async function resolveTicket(id: number): Promise<TicketResponse> {
  const { data } = await api.patch<TicketResponse>(`/tickets/${id}/resolve`)
  return data
}
