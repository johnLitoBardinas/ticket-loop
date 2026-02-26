import { useTickets, useResolveTicket } from '../hooks/useTickets'
import { useUIStore } from '../stores/uiStore'

const TicketListPage = () => {
  const { data: tickets, isLoading, isError } = useTickets()
  const { statusFilter, setStatusFilter } = useUIStore()
  const resolveTicket = useResolveTicket()

  const filteredTickets = tickets?.filter((ticket) => {
    if (statusFilter === 'all') return true
    return ticket.status === statusFilter
  })

  if (isLoading) {
    return <p className="text-gray-500">Loading tickets...</p>
  }

  if (isError) {
    return <p className="text-red-600">Failed to load tickets.</p>
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'open', 'resolved'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              statusFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredTickets && filteredTickets.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Full Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Issue Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{ticket.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{ticket.contact.full_name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{ticket.contact.email}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-700">{ticket.issue_description}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ticket.status === 'open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {ticket.status === 'open' ? (
                      <button
                        onClick={() => resolveTicket.mutate(ticket.id)}
                        disabled={resolveTicket.isPending}
                        className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {resolveTicket.isPending ? 'Resolving...' : 'Resolve'}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No tickets found.</p>
      )}
    </div>
  )
}

export default TicketListPage;
