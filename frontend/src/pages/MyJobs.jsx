import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import JobFormModal from '../components/JobFormModal'

function statusBadge(job) {
  if (!job.isActive) return { label: 'Inactive', cls: 'badge-error' }
  if (!job.isApproved) return { label: 'Pending approval', cls: 'badge-warning' }
  return { label: 'Live', cls: 'badge-success' }
}

function MyJobs() {
  const { isRecruiter } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  if (!isRecruiter) {
    navigate('/dashboard')
    return null
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const res = await api.get('/jobs/my-jobs', { params: { limit: 100 } })
      setJobs(res.data.data || [])
    } catch (error) {
      console.error('Failed to load jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-gray-600 mt-1">Manage the jobs you have posted</p>
          </div>
          <Link to="/post-job" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-1" />
            Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-600 mb-4">Post your first job to start receiving applications.</p>
            <Link to="/post-job" className="btn btn-primary">Post a Job</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const s = statusBadge(job)
              return (
                <div key={job.id} className="bg-white rounded-lg shadow-soft p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="badge badge-outline">{job.jobType}</span>
                      <span className={`badge ${s.cls}`}>{s.label}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigate(`/jobs/${job.id}`)} className="btn btn-outline btn-sm">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </button>
                    <button onClick={() => setEditing(job)} className="btn btn-outline btn-sm">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteJob(job)}
                      className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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

export default MyJobs
