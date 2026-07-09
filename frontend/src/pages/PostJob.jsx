import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Briefcase, DollarSign, MapPin, Calendar, Save } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function PostJob() {
  const { user, isRecruiter } = useAuth()
  const navigate = useNavigate()
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    company: '',
    location: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    category: '',
    industry: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'yearly',
    benefits: '',
    applicationDeadline: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Redirect if not recruiter
  if (!isRecruiter) {
    navigate('/dashboard')
    return null
  }

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
  ]

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'executive', label: 'Executive' }
  ]

  const categories = [
    'Software Development',
    'Design',
    'Marketing',
    'Sales',
    'Data Science',
    'DevOps',
    'Product Management',
    'Business Analysis',
    'Customer Support',
    'HR',
    'Finance',
    'Operations'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setJobData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!jobData.title || !jobData.description || !jobData.company || !jobData.location) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      
      // Convert salary fields to numbers
      const formattedData = {
        ...jobData,
        salaryMin: jobData.salaryMin ? parseInt(jobData.salaryMin) : null,
        salaryMax: jobData.salaryMax ? parseInt(jobData.salaryMax) : null,
        applicationDeadline: jobData.applicationDeadline || null
      }

      const response = await api.post('/jobs', formattedData)
      toast.success('Job posted successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post job')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 mt-1">Find the perfect candidate for your position</p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={jobData.company}
                    onChange={handleInputChange}
                    placeholder="Your company name"
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={jobData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={jobData.category}
                    onChange={handleInputChange}
                    className="select w-full"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    name="jobType"
                    value={jobData.jobType}
                    onChange={handleInputChange}
                    className="select w-full"
                  >
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={jobData.experienceLevel}
                    onChange={handleInputChange}
                    className="select w-full"
                  >
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={jobData.industry}
                    onChange={handleInputChange}
                    placeholder="e.g. Technology"
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Salary Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={jobData.salaryMin}
                    onChange={handleInputChange}
                    placeholder="50000"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={jobData.salaryMax}
                    onChange={handleInputChange}
                    placeholder="80000"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Type
                  </label>
                  <select
                    name="salaryType"
                    value={jobData.salaryType}
                    onChange={handleInputChange}
                    className="select w-full"
                  >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={jobData.applicationDeadline}
                  onChange={handleInputChange}
                  className="input w-full md:w-1/3"
                />
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={jobData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="textarea w-full"
                  placeholder="Describe the role, team, and what the candidate will be working on..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  value={jobData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className="textarea w-full"
                  placeholder="List the required skills, experience, education, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities
                </label>
                <textarea
                  name="responsibilities"
                  value={jobData.responsibilities}
                  onChange={handleInputChange}
                  rows={4}
                  className="textarea w-full"
                  placeholder="What will the candidate be responsible for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits
                </label>
                <textarea
                  name="benefits"
                  value={jobData.benefits}
                  onChange={handleInputChange}
                  rows={3}
                  className="textarea w-full"
                  placeholder="Health insurance, retirement plans, flexible work, etc..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-outline"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Job...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostJob 