import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  Check,
  X,
  Pencil,
  Mail,
  Phone
} from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { sanitizePhone, isValidPhone, PHONE_HINT } from '../utils/validation'

const EMPTY_EDIT = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  role: 'seeker',
  isActive: true,
  isVerified: false
}

function AdminUsers() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  })
  const [editing, setEditing] = useState(null) // user being edited
  const [editForm, setEditForm] = useState(EMPTY_EDIT)
  const [saving, setSaving] = useState(false)

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/dashboard')
    return null
  }

  // Debounced refetch whenever filters change (keeps the search input mounted/focused)
  useEffect(() => {
    const delay = initialLoad ? 0 : 350
    const timer = setTimeout(() => fetchUsers(1), delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)

      const params = { page, limit: 20 }
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim()
      }
      if (filters.role) {
        params.role = filters.role
      }
      if (filters.status === 'active') params.isActive = true
      if (filters.status === 'inactive') params.isActive = false

      const response = await api.get('/admin/users', { params })
      const p = response.data.pagination || {}

      setUsers(response.data.users || [])
      setPagination({
        currentPage: p.currentPage || 1,
        totalPages: p.totalPages || 1,
        totalItems: p.totalUsers || 0,
        hasPrev: (p.currentPage || 1) > 1,
        hasNext: (p.currentPage || 1) < (p.totalPages || 1)
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
      setUsers([])
      setPagination({})
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  const updateUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive })
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully!`)
      fetchUsers(pagination.currentPage)
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const openEdit = (userItem) => {
    setEditing(userItem)
    setEditForm({
      firstName: userItem.firstName || '',
      lastName: userItem.lastName || '',
      email: userItem.email || '',
      phone: userItem.phone || '',
      location: userItem.location || '',
      role: userItem.role || 'seeker',
      isActive: !!userItem.isActive,
      isVerified: !!userItem.isVerified
    })
  }

  const closeEdit = () => {
    setEditing(null)
    setEditForm(EMPTY_EDIT)
    setSaving(false)
  }

  const handleEditChange = (key, value) => {
    setEditForm(prev => ({ ...prev, [key]: key === 'phone' ? sanitizePhone(value) : value }))
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editing) return
    if (!isValidPhone(editForm.phone)) {
      toast.error(PHONE_HINT)
      return
    }
    try {
      setSaving(true)
      await api.put(`/admin/users/${editing.id}`, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        location: editForm.location.trim(),
        role: editForm.role,
        isActive: editForm.isActive,
        isVerified: editForm.isVerified
      })
      toast.success('User updated successfully!')
      closeEdit()
      fetchUsers(pagination.currentPage)
    } catch (error) {
      // api interceptor already surfaces the message
      setSaving(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(1)
  }

  if (initialLoad) {
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
          <p className="text-gray-600 flex items-center gap-2">
            {pagination.totalItems || 0} users found
            {loading && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 inline-block" />
            )}
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
                    <td className="px-6 py-4 text-sm font-medium">
                     <div className="flex flex-wrap gap-2">
                      {userItem.isActive ? (
                        <button
                          onClick={() => updateUserStatus(userItem.id, false)}
                          className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                          disabled={userItem.id === user?.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(userItem.id, true)}
                          className="btn btn-primary btn-sm"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(userItem)}
                        className="btn btn-outline btn-sm"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                     </div>
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

      {/* Edit User Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit user &mdash; {editing.firstName} {editing.lastName}
              </h2>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveEdit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => handleEditChange('firstName', e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => handleEditChange('lastName', e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  className="input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={18}
                    placeholder="9812345678"
                    value={editForm.phone}
                    onChange={(e) => handleEditChange('phone', e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => handleEditChange('role', e.target.value)}
                  className="select w-full"
                  disabled={editing.id === user?.id}
                >
                  <option value="seeker">Job Seeker</option>
                  <option value="recruiter">Recruiter (job poster)</option>
                  <option value="admin">Admin</option>
                </select>
                {editing.id === user?.id && (
                  <p className="text-xs text-gray-500 mt-1">You cannot change your own role.</p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => handleEditChange('isActive', e.target.checked)}
                    disabled={editing.id === user?.id}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.isVerified}
                    onChange={(e) => handleEditChange('isVerified', e.target.checked)}
                  />
                  Verified
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEdit} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
