import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Briefcase, 
  FileText, 
  Bell, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [recentUsers, setRecentUsers] = useState([])
  const [pendingJobs, setPendingJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/dashboard')
    return null
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch admin dashboard stats
      const statsResponse = await api.get('/admin/dashboard')
      setStats(statsResponse.data.stats)

      // Fetch recent users
      const usersResponse = await api.get('/admin/users?limit=5')
      setRecentUsers(usersResponse.data.users || [])

      // Fetch pending jobs
      const jobsResponse = await api.get('/admin/jobs?isApproved=false&limit=5')
      setPendingJobs(jobsResponse.data.jobs || [])
      
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const approveJob = async (jobId) => {
    try {
      await api.put(`/admin/jobs/${jobId}/approval`, { isApproved: true })
      toast.success('Job approved successfully!')
      fetchAdminData()
    } catch (error) {
      toast.error('Failed to approve job')
    }
  }

  const rejectJob = async (jobId) => {
    try {
      await api.put(`/admin/jobs/${jobId}/approval`, { isApproved: false })
      toast.success('Job rejected')
      fetchAdminData()
    } catch (error) {
      toast.error('Failed to reject job')
    }
  }

  const updateUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive })
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully!`)
      fetchAdminData()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View all
              </button>
            </div>

            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent users</p>
              ) : (
                recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`badge ${
                          user.role === 'admin' ? 'badge-primary' : 
                          user.role === 'recruiter' ? 'badge-secondary' : 'badge-outline'
                        }`}>
                          {user.role}
                        </span>
                        <span className={`badge ${
                          user.isActive ? 'badge-success' : 'badge-error'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {user.isActive ? (
                        <button
                          onClick={() => updateUserStatus(user.id, false)}
                          className="btn btn-outline btn-sm text-red-600"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(user.id, true)}
                          className="btn btn-primary btn-sm"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Jobs */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Pending Job Approvals</h2>
              <button
                onClick={() => navigate('/admin/jobs')}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View all
              </button>
            </div>

            <div className="space-y-4">
              {pendingJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending jobs</p>
              ) : (
                pendingJobs.map(job => (
                  <div key={job.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="badge badge-outline">{job.jobType}</span>
                          <span className="badge badge-outline">{job.experienceLevel}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveJob(job.id)}
                        className="btn btn-primary btn-sm flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectJob(job.id)}
                        className="btn btn-outline btn-sm text-red-600 flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="btn btn-outline btn-sm flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-soft p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="btn btn-outline flex items-center justify-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="btn btn-outline flex items-center justify-center"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Manage Jobs
            </button>
            <button
              onClick={() => navigate('/admin/skills')}
              className="btn btn-outline flex items-center justify-center"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Manage Skills
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="btn btn-outline flex items-center justify-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 