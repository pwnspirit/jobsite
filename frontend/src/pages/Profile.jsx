import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, MapPin, Briefcase, Upload, Save } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    experience: '',
    expectedSalary: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/profile')
      const userData = response.data.user
      setProfile({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || '',
        experience: userData.experience || '',
        expectedSalary: userData.expectedSalary || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await api.put('/users/profile', profile)
      updateUser(response.data.user)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('resume', file)

      const response = await api.post('/users/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      updateUser(response.data.user)
      toast.success('Resume uploaded successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload resume')
    } finally {
      setUploading(false)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-soft p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      placeholder="City, State"
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="textarea w-full"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {user?.role === 'seeker' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience Level
                        </label>
                        <select
                          name="experience"
                          value={profile.experience}
                          onChange={handleInputChange}
                          className="select w-full"
                        >
                          <option value="">Select experience level</option>
                          <option value="entry">Entry Level</option>
                          <option value="junior">Junior</option>
                          <option value="mid">Mid Level</option>
                          <option value="senior">Senior</option>
                          <option value="executive">Executive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Salary (Annual)
                        </label>
                        <input
                          type="number"
                          name="expectedSalary"
                          value={profile.expectedSalary}
                          onChange={handleInputChange}
                          placeholder="50000"
                          className="input w-full"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
                <button className="btn btn-outline btn-sm">
                  Upload Photo
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG max 2MB
                </p>
              </div>
            </div>

            {/* Resume Upload */}
            {user?.role === 'seeker' && (
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
                
                {user?.resumePath ? (
                  <div className="mb-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">Resume uploaded</span>
                    </div>
                    <div className="mt-2">
                      <a
                        href={`/api/uploads/${user.resumePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View current resume
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <Upload className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-700">No resume uploaded</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="btn btn-primary btn-sm cursor-pointer flex items-center justify-center">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {user?.resumePath ? 'Update Resume' : 'Upload Resume'}
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOC, DOCX max 5MB
                  </p>
                </div>
              </div>
            )}

            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Basic Info</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contact Details</span>
                  <span className={profile.phone ? "text-green-600" : "text-gray-400"}>
                    {profile.phone ? "✓" : "○"}
                  </span>
                </div>
                {user?.role === 'seeker' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Resume</span>
                      <span className={user?.resumePath ? "text-green-600" : "text-gray-400"}>
                        {user?.resumePath ? "✓" : "○"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Experience</span>
                      <span className={profile.experience ? "text-green-600" : "text-gray-400"}>
                        {profile.experience ? "✓" : "○"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 