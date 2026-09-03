import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import JobList from './pages/JobList'
import JobDetail from './pages/JobDetail'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import PostJob from './pages/PostJob'
import MyJobs from './pages/MyJobs'
import Applications from './pages/Applications'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminJobs from './pages/AdminJobs'
import AdminSkills from './pages/AdminSkills'
import AdminReports from './pages/AdminReports'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="jobs" element={<JobList />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs/my-jobs" element={<MyJobs />} />
          <Route path="applications" element={<Applications />} />
        </Route>

        {/* Public job detail (declared after jobs/my-jobs so the static path wins) */}
        <Route path="jobs/:id" element={<JobDetail />} />

        {/* Admin routes */}
        <Route element={<ProtectedRoute requireRole="admin" />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/jobs" element={<AdminJobs />} />
          <Route path="admin/skills" element={<AdminSkills />} />
          <Route path="admin/reports" element={<AdminReports />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App 