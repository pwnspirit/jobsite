import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Briefcase, 
  Users, 
  FileText, 
  Bell, 
  TrendingUp,
  Calendar,
  Award,
  Target
} from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function Dashboard() {
  const { user, isSeeker, isRecruiter, isAdmin } = useAuth()
  const [stats, setStats] = useState({})
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user dashboard stats
      const statsResponse = await api.get('/users/dashboard')
      setStats(statsResponse.data.stats)

      // Fetch recent notifications
      const notificationsResponse = await api.get('/notifications?limit=5')
      setNotifications(notificationsResponse.data.notifications)
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const SeekerDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Bookmarked Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBookmarks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Profile Completion</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.profileCompletion || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
          <Link to="/profile" className="btn btn-outline">
            Update Profile
          </Link>
          <Link to="/applications" className="btn btn-outline">
            View Applications
          </Link>
          <Link to="/profile#resume" className="btn btn-outline">
            Upload Resume
          </Link>
        </div>
      </div>
    </div>
  )

  const RecruiterDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Jobs Posted</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeJobs || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/post-job" className="btn btn-primary">
            Post New Job
          </Link>
          <Link to="/jobs/my-jobs" className="btn btn-outline">
            Manage Jobs
          </Link>
          <Link to="/applications" className="btn btn-outline">
            Review Applications
          </Link>
          <Link to="/profile" className="btn btn-outline">
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  )

  const AdminDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-soft">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingJobApprovals || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin" className="btn btn-primary">
            Admin Panel
          </Link>
          <Link to="/admin/users" className="btn btn-outline">
            Manage Users
          </Link>
          <Link to="/admin/jobs" className="btn btn-outline">
            Manage Jobs
          </Link>
          <Link to="/admin/reports" className="btn btn-outline">
            View Reports
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            {isSeeker && "Here's what's happening with your job search"}
            {isRecruiter && "Here's an overview of your recruiting activity"}
            {isAdmin && "Here's your system overview"}
          </p>
        </div>

        {/* Role-specific Dashboard */}
        {isSeeker && <SeekerDashboard />}
        {isRecruiter && <RecruiterDashboard />}
        {isAdmin && <AdminDashboard />}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-soft mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
              <Link to="/notifications" className="text-primary-600 hover:text-primary-700 text-sm">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 