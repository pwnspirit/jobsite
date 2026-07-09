import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Filter,
  Check,
  X,
  Eye,
  Mail,
  Phone
} from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function AdminUsers() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  })

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/dashboard')
    return null
  }

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      
      const params = {
        page,
        limit: 20
      }

      // Only add non-empty filter values
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim()
      }
      if (filters.role && filters.role.trim()) {
        params.role = filters.role.trim()
      }
      if (filters.status && filters.status.trim()) {
        params.status = filters.status.trim()
      }

      const response = await api.get('/admin/users', { params })
      setUsers(response.data.data || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
      setUsers([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status })
      toast.success(`User ${status} successfully!`)
      fetchUsers()
    } catch (error) {
      toast.error(`Failed to ${status} user`)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-soft mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="select w-full"
              >
                <option value="">All Roles</option>
                <option value="seeker">Job Seekers</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="md:w-48">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="select w-full"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary px-8">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {pagination.totalItems || 0} users found
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.firstName} {userItem.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {userItem.email}
                          </div>
                          {userItem.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {userItem.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        userItem.role === 'admin' ? 'badge-primary' : 
                        userItem.role === 'recruiter' ? 'badge-secondary' : 'badge-outline'
                      }`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        userItem.isActive ? 'badge-success' : 'badge-error'
                      }`}>
                        {userItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {userItem.isVerified && (
                        <span className="badge badge-success ml-2">
                          Verified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {userItem.isActive ? (
                        <button
                          onClick={() => updateUserStatus(userItem.id, 'inactive')}
                          className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                          disabled={userItem.role === 'admin'}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(userItem.id, 'active')}
                          className="btn btn-primary btn-sm"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Activate
                        </button>
                      )}
                      {userItem.role !== 'admin' && (
                        <button className="btn btn-outline btn-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="bg-white rounded-lg shadow-soft p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {pagination.hasPrev && (
                <button
                  onClick={() => fetchUsers(pagination.currentPage - 1)}
                  className="btn btn-outline"
                >
                  Previous
                </button>
              )}
              <span className="flex items-center px-4 py-2 text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              {pagination.hasNext && (
                <button
                  onClick={() => fetchUsers(pagination.currentPage + 1)}
                  className="btn btn-outline"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers 