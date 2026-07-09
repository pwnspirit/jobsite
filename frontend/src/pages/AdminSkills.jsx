import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Award, Plus, Edit, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function AdminSkills() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/dashboard')
    return null
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/skills')
      setSkills(response.data.skills || [])
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      toast.error('Failed to load skills')
      setSkills([])
    } finally {
      setLoading(false)
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
            <p className="text-gray-600 mt-1">Manage system skills and categories</p>
          </div>
          <button className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills ({skills.length})</h2>
          {skills.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
              <p className="text-gray-600">Add skills to help users tag their expertise</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map(skill => (
                <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{skill.name}</h3>
                    <div className="flex space-x-1">
                      <button className="btn btn-outline btn-sm p-1">
                        <Edit className="h-3 w-3" />
                      </button>
                      <button className="btn btn-outline btn-sm p-1 text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {skill.category && (
                    <span className="badge badge-outline text-xs">{skill.category}</span>
                  )}
                  {skill.description && (
                    <p className="text-sm text-gray-600 mt-2">{skill.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSkills 