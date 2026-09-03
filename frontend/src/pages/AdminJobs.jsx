import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Briefcase, CheckCircle, XCircle, Eye, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import JobFormModal from '../components/JobFormModal'

function AdminJobs() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | pending | approved | inactive
  const [editing, setEditing] = useState(null)

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/dashboard')
    return null
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/jobs', { params: { limit: 100 } })
      setJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to load jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const updateJobApproval = async (jobId, isApproved) => {
    try {
      await api.put(`/admin/jobs/${jobId}/approval`, { isApproved })
      toast.success(`Job ${isApproved ? 'approved' : 'rejected'} successfully!`)
      fetchJobs()
    } catch (error) {
      toast.error('Failed to update job')
    }
  }

  const deleteJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? It will be removed from public listings.`)) return
    try {
      await api.delete(`/jobs/${job.id}`)
      toast.success('Job deleted')
      fetchJobs()
    } catch (error) {
      // interceptor surfaces message
    }
  }

  const reactivateJob = async (job) => {
    try {
      await api.put(`/jobs/${job.id}`, { isActive: true })
      toast.success('Job reactivated')
      fetchJobs()
    } catch (error) {
      // interceptor surfaces message
    }
  }

  const visibleJobs = jobs.filter(job => {
    if (filter === 'pending') return job.isActive && !job.isApproved
    if (filter === 'approved') return job.isActive && job.isApproved
    if (filter === 'inactive') return !job.isActive
    return true
  })

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-1">Review, edit and manage job postings</p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {visibleJobs.length} job{visibleJobs.length === 1 ? '' : 's'}
            </h2>
            <div className="w-48">
              <select className="select w-full" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All jobs</option>
                <option value="pending">Pending approval</option>
                <option value="approved">Approved &amp; live</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {visibleJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Nothing matches this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleJobs.map(job => (
                <div key={job.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">
                      {job.company} • {job.location}
                      {job.recruiter && <> • by {job.recruiter.firstName} {job.recruiter.lastName}</>}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="badge badge-outline">{job.jobType}</span>
                      {!job.isActive ? (
                        <span className="badge badge-error">Inactive</span>
                      ) : job.isApproved ? (
                        <span className="badge badge-success">Approved</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.isActive && !job.isApproved && (
                      <>
                        <button onClick={() => updateJobApproval(job.id, true)} className="btn btn-primary btn-sm">
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </button>
                        <button onClick={() => updateJobApproval(job.id, false)} className="btn btn-outline btn-sm text-red-600">
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => navigate(`/jobs/${job.id}`)} className="btn btn-outline btn-sm">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </button>
                    <button onClick={() => setEditing(job)} className="btn btn-outline btn-sm">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </button>
                    {job.isActive ? (
                      <button
                        onClick={() => deleteJob(job)}
                        className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    ) : (
                      <button onClick={() => reactivateJob(job)} className="btn btn-outline btn-sm">
                        <RotateCcw className="h-4 w-4 mr-1" /> Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <JobFormModal
          job={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchJobs() }}
        />
      )}
    </div>
  )
}

export default AdminJobs
