import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ClassPage from './pages/ClassPage'
import StudentDirectoryPage from './pages/StudentDirectoryPage'
import TeacherDirectoryPage from './pages/TeacherDirectoryPage'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/classes/:classId" element={<ClassPage />} />
          <Route path="/students" element={<StudentDirectoryPage />} />
          <Route path="/teachers" element={<TeacherDirectoryPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
