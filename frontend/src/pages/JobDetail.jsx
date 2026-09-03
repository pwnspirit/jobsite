import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  Users, 
  Briefcase,
  Bookmark,
  ArrowLeft,
  Send
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/jobs/${id}`)
      setJob(response.data.job)
    } catch (error) {
      console.error('Failed to fetch job:', error)
      toast.error('Failed to load job details')
      navigate('/jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })
      return
    }

    try {
      setApplying(true)
      await api.post('/applications', {
        jobId: parseInt(id),
        coverLetter: coverLetter.trim()
      })
      
      toast.success('Application submitted successfully!')
      setJob(prev => ({ ...prev, hasApplied: true }))
      setShowApplyForm(false)
      setCoverLetter('')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      if (job.isBookmarked) {
        await api.delete(`/users/bookmarks/${job.id}`)
        toast.success('Job removed from bookmarks')
      } else {
        await api.post('/users/bookmarks', { jobId: job.id })
        toast.success('Job bookmarked!')
      }
      
      setJob(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }))
    } catch (error) {
      toast.error('Failed to update bookmark')
    }
  }

  const formatSalary = (job) => {
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
    } else if (job.salaryMin) {
      return `$${job.salaryMin.toLocaleString()}+`
    }
    return 'Salary not specified'
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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <button onClick={() => navigate('/jobs')} className="btn btn-primary">
            Browse Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to jobs
        </button>

        {/* Status banner (only shown for owner/admin on non-live jobs) */}
        {job.isApproved === false && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            This job is <strong>pending admin approval</strong> and is not visible on the public job board yet.
          </div>
        )}
        {job.isActive === false && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            This job is <strong>inactive</strong> and hidden from the public job board.
          </div>
        )}

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-soft p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Building className="h-5 w-5 mr-2" />
                  <span className="text-lg">{job.company}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>{formatSalary(job)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Posted {getTimeAgo(job.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3 mt-6 md:mt-0">
              {isAuthenticated && user?.role === 'seeker' && !job.hasApplied && (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="btn btn-primary"
                >
                  Apply Now
                </button>
              )}
              
              {job.hasApplied && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-center">
                  ✓ Already Applied
                </div>
              )}

              <button
                onClick={handleBookmark}
                className={`btn ${job.isBookmarked ? 'btn-primary' : 'btn-outline'} flex items-center`}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                {job.isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
          </div>

          {/* Job Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary">{job.jobType}</span>
            <span className="badge badge-secondary">{job.experienceLevel}</span>
            <span className="badge badge-outline">{job.category}</span>
            {job.industry && (
              <span className="badge badge-outline">{job.industry}</span>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-soft p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-lg shadow-soft p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-lg shadow-soft p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{job.responsibilities}</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white rounded-lg shadow-soft p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Company</span>
                  <p className="font-medium">{job.company}</p>
                </div>
                {job.recruiter && (
                  <div>
                    <span className="text-sm text-gray-500">Recruiter</span>
                    <p className="font-medium">
                      {job.recruiter.firstName} {job.recruiter.lastName}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Industry</span>
                  <p className="font-medium">{job.industry || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Job Stats */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{job.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium">{job.applicationsCount || 0}</span>
                </div>
                {job.applicationDeadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-medium">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Apply Form Modal */}
        {showApplyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Apply for {job.title}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className="textarea w-full"
                  placeholder="Tell the employer why you're a great fit for this role..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="btn btn-outline flex-1"
                  disabled={applying}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  {applying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Applying...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetail 