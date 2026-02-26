import { z } from 'zod'

export const ticketCreateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  issue_description: z.string().min(1, 'Issue description is required'),
})

export type TicketCreate = z.infer<typeof ticketCreateSchema>

export const contactResponseSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  email: z.string(),
  created_at: z.string(),
})

export const ticketResponseSchema = z.object({
  id: z.number(),
  contact_id: z.number(),
  issue_description: z.string(),
  status: z.string(),
  created_at: z.string(),
  contact: contactResponseSchema,
})

export type TicketResponse = z.infer<typeof ticketResponseSchema>
