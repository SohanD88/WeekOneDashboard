import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ClassPage from './pages/ClassPage'
import DirectoryPage from './pages/DirectoryPage'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/classes/:classId" element={<ClassPage />} />
          <Route path="/students" element={<DirectoryPage />} />
          <Route path="/teachers" element={<DirectoryPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
