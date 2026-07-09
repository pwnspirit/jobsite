import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Search, CheckCircle, XCircle, Eye } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function AdminJobs() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

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
      const response = await api.get('/admin/jobs')
      setJobs(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to load jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const updateJobApproval = async (jobId, status) => {
    try {
      await api.put(`/admin/jobs/${jobId}/approval`, { status })
      toast.success(`Job ${status} successfully!`)
      fetchJobs()
    } catch (error) {
      toast.error(`Failed to ${status} job`)
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-1">Review and manage job postings</p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h2>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">No job postings to review at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 10).map(job => (
                <div key={job.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="badge badge-outline">{job.jobType}</span>
                      <span className={`badge ${job.isApproved ? 'badge-success' : 'badge-warning'}`}>
                        {job.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!job.isApproved && (
                      <>
                        <button
                          onClick={() => updateJobApproval(job.id, 'approved')}
                          className="btn btn-primary btn-sm flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateJobApproval(job.id, 'rejected')}
                          className="btn btn-outline btn-sm text-red-600 flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminJobs 