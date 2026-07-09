import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  FileText, 
  Eye, 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function Applications() {
  const { user, isSeeker, isRecruiter } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      let url = '/applications/my-applications'
      
      if (isRecruiter) {
        url = '/applications/recruiter'
      }
      
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }
      
      const response = await api.get(`${url}?${params.toString()}`)
      setApplications(response.data.applications)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status })
      toast.success(`Application ${status.replace('_', ' ')}`)
      fetchApplications()
    } catch (error) {
      toast.error('Failed to update application status')
    }
  }

  const withdrawApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return
    
    try {
      await api.post(`/applications/${applicationId}/withdraw`)
      toast.success('Application withdrawn')
      fetchApplications()
    } catch (error) {
      toast.error('Failed to withdraw application')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { color: 'bg-blue-100 text-blue-800', label: 'Applied' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
      shortlisted: { color: 'bg-purple-100 text-purple-800', label: 'Shortlisted' },
      interviewed: { color: 'bg-indigo-100 text-indigo-800', label: 'Interviewed' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      hired: { color: 'bg-green-100 text-green-800', label: 'Hired' }
    }
    
    const config = statusConfig[status] || statusConfig.applied
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatSalary = (job) => {
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
    } else if (job.salaryMin) {
      return `$${job.salaryMin.toLocaleString()}+`
    }
    return 'Not specified'
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isSeeker ? 'My Applications' : 'Job Applications'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSeeker 
              ? 'Track your job applications and their status'
              : 'Review and manage applications for your job postings'
            }
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-soft mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('applied')}
              className={`btn ${filter === 'applied' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              Applied
            </button>
            <button
              onClick={() => setFilter('under_review')}
              className={`btn ${filter === 'under_review' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              Under Review
            </button>
            <button
              onClick={() => setFilter('shortlisted')}
              className={`btn ${filter === 'shortlisted' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              Shortlisted
            </button>
            <button
              onClick={() => setFilter('interviewed')}
              className={`btn ${filter === 'interviewed' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              Interviewed
            </button>
            <button
              onClick={() => setFilter('hired')}
              className={`btn ${filter === 'hired' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              Hired
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-soft text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {isSeeker 
                  ? "You haven't applied to any jobs yet. Start browsing jobs to apply!"
                  : "No applications received yet for your job postings."
                }
              </p>
              {isSeeker && (
                <Link to="/jobs" className="btn btn-primary mt-4">
                  Browse Jobs
                </Link>
              )}
            </div>
          ) : (
            applications.map((application) => (
              <div key={application.id} className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex flex-col lg:flex-row justify-between">
                  {/* Application Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          <Link 
                            to={`/jobs/${application.job.id}`}
                            className="hover:text-primary-600"
                          >
                            {application.job.title}
                          </Link>
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {application.job.company}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {application.job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatSalary(application.job)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied {getTimeAgo(application.appliedAt)}
                          </div>
                        </div>

                        {/* Show applicant info for recruiters */}
                        {isRecruiter && application.applicant && (
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <User className="h-4 w-4 mr-1" />
                            <span className="font-medium">
                              {application.applicant.firstName} {application.applicant.lastName}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{application.applicant.email}</span>
                            {application.applicant.phone && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{application.applicant.phone}</span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {getStatusBadge(application.status)}
                          <span className="badge badge-outline">
                            {application.job.jobType}
                          </span>
                          <span className="badge badge-outline">
                            {application.job.experienceLevel}
                          </span>
                        </div>

                        {application.coverLetter && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter:</h4>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col lg:ml-6 mt-4 lg:mt-0">
                    {isSeeker && (
                      <div className="flex flex-col space-y-2">
                        <Link
                          to={`/jobs/${application.job.id}`}
                          className="btn btn-outline btn-sm flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Job
                        </Link>
                        {application.status === 'applied' && !application.isWithdrawn && (
                          <button
                            onClick={() => withdrawApplication(application.id)}
                            className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    )}

                    {isRecruiter && (
                      <div className="flex flex-col space-y-2">
                        {application.status === 'applied' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'under_review')}
                              className="btn btn-primary btn-sm"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                              className="btn btn-outline btn-sm"
                            >
                              Shortlist
                            </button>
                          </>
                        )}
                        
                        {application.status === 'under_review' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                              className="btn btn-primary btn-sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Shortlist
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'interviewed')}
                              className="btn btn-outline btn-sm"
                            >
                              Interview
                            </button>
                          </>
                        )}

                        {application.status === 'shortlisted' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'interviewed')}
                              className="btn btn-primary btn-sm"
                            >
                              Schedule Interview
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'hired')}
                              className="btn btn-outline btn-sm"
                            >
                              Hire
                            </button>
                          </>
                        )}

                        {application.status === 'interviewed' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'hired')}
                              className="btn btn-primary btn-sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Hire
                            </button>
                          </>
                        )}

                        {!['rejected', 'hired'].includes(application.status) && (
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        )}

                        {/* View Resume Link */}
                        {application.applicant?.resumePath && (
                          <a
                            href={`/api/uploads/${application.applicant.resumePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm flex items-center justify-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Resume
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Applications 