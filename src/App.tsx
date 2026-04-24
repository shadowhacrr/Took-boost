import { Routes, Route } from 'react-router'
import OwnerLogin from './pages/OwnerLogin'
import OwnerPanel from './pages/OwnerPanel'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import UserPanel from './pages/UserPanel'
import ComplaintPage from './pages/ComplaintPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OwnerLogin />} />
      <Route path="/owner" element={<OwnerPanel />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/panel/:link" element={<UserPanel />} />
      <Route path="/complaint" element={<ComplaintPage />} />
    </Routes>
  )
}
