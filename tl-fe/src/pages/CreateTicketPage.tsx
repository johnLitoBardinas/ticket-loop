import TicketForm from '../components/TicketForm'

const CreateTicketPage = () => {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Ticket</h1>
      <TicketForm />
    </div>
  )
}

export default CreateTicketPage;
