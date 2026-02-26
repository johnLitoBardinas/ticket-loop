import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ticketCreateSchema, type TicketCreate } from '../schemas/ticket'
import { useCreateTicket } from '../hooks/useTickets'
import { useNavigate } from 'react-router-dom'

const TicketForm = () => {
  const navigate = useNavigate()
  const createTicket = useCreateTicket()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketCreate>({
    resolver: zodResolver(ticketCreateSchema),
  })

  const onSubmit = (data: TicketCreate) => {
    createTicket.mutate(data, {
      onSuccess: () => navigate('/admin'),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          id="full_name"
          {...register('full_name')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="issue_description" className="block text-sm font-medium text-gray-700 mb-1">
          Issue Description *
        </label>
        <textarea
          id="issue_description"
          rows={4}
          {...register('issue_description')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.issue_description && (
          <p className="mt-1 text-sm text-red-600">{errors.issue_description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={createTicket.isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {createTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
      </button>

      {createTicket.isError && (
        <p className="text-sm text-red-600">
          Failed to create ticket. Please try again.
        </p>
      )}
    </form>
  )
}

export default TicketForm;