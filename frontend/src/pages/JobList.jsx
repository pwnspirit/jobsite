import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Filter, Briefcase, DollarSign, Clock, Building } from 'lucide-react'
import { api, apiHelpers, endpoints } from '../services/api'
import toast from 'react-hot-toast'

function JobList() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    sortBy: searchParams.get('sortBy') || 'latest'
  })

  const jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
  ]

  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'executive', label: 'Executive' }
  ]

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Software Development', label: 'Software Development' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Product Management', label: 'Product Management' }
  ]

  useEffect(() => {
    fetchJobs()
  }, [searchParams])

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true)
      
      // Build query parameters, excluding empty values
      const params = {
        page,
        limit: 12,
        sortBy: filters.sortBy || 'latest'
      };

      // Only add non-empty filter values
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.location && filters.location.trim()) {
        params.location = filters.location.trim();
      }
      if (filters.category && filters.category.trim()) {
        params.category = filters.category.trim();
      }
      if (filters.jobType && filters.jobType.trim()) {
        params.jobType = filters.jobType.trim();
      }
      if (filters.experienceLevel && filters.experienceLevel.trim()) {
        params.experienceLevel = filters.experienceLevel.trim();
      }
      
      const response = await api.get(endpoints.jobs.list, { params });
      
      setJobs(response.data.data || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to load jobs')
      setJobs([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    handleFilterChange('search', filters.search)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Job</h1>
          <p className="text-gray-600">Discover opportunities that match your skills and career goals</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-soft mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary px-8">
              Search Jobs
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-soft mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="select w-full"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="select w-full"
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="select w-full"
              >
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="select w-full"
              >
                <option value="latest">Latest</option>
                <option value="relevant">Most Relevant</option>
                <option value="high-paying">High Paying</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {pagination.totalItems || 0} jobs found
          </p>
        </div>

        {/* Job List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="bg-white p-6 rounded-lg shadow-soft hover:shadow-medium transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="h-4 w-4 mr-1" />
                    <span className="text-sm">{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                </div>
                {job.isBookmarked && (
                  <div className="text-primary-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge badge-primary">
                  {job.jobType}
                </span>
                <span className="badge badge-secondary">
                  {job.experienceLevel}
                </span>
                <span className="badge badge-outline">
                  {job.category}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{formatSalary(job)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{getTimeAgo(job.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {pagination.hasPrev && (
                <button
                  onClick={() => fetchJobs(pagination.currentPage - 1)}
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
                  onClick={() => fetchJobs(pagination.currentPage + 1)}
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

export default JobList 