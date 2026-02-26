import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import TicketListPage from './pages/TicketListPage'
import CreateTicketPage from './pages/CreateTicketPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/admin" replace /> },
      { path: '/admin', element: <TicketListPage /> },
      { path: '/create', element: <CreateTicketPage /> },
    ],
  },
])
