import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import TourPage from '@/pages/TourPage'
import HistoryPage from '@/pages/HistoryPage'
import AdminPage from '@/pages/admin/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tour" element={<TourPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}
