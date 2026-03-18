import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Agents from '@/pages/Agents'
import Tasks from '@/pages/Tasks'
import Logs from '@/pages/Logs'
import Alerts from '@/pages/Alerts'
import Topology from '@/pages/Topology'
import Settings from '@/pages/Settings'
import Users from '@/pages/Users'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/topology" element={<Topology />} />
      <Route path="/users" element={<Users />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
