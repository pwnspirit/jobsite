import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']
const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'executive']
const SALARY_TYPES = ['yearly', 'monthly', 'hourly']
const CATEGORIES = [
  'Software Development', 'Design', 'Marketing', 'Sales', 'Data Science',
  'DevOps', 'Product Management', 'Business Analysis', 'Customer Support',
  'HR', 'Finance', 'Operations'
]

// Shared "edit job" modal used by both the recruiter (My Jobs) and admin (Job Management) screens.
function JobFormModal({ job, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: job.title || '',
    company: job.company || '',
    location: job.location || '',
    category: job.category || '',
    jobType: job.jobType || 'full-time',
    experienceLevel: job.experienceLevel || 'mid',
    industry: job.industry || '',
    salaryMin: job.salaryMin ?? '',
    salaryMax: job.salaryMax ?? '',
    salaryType: job.salaryType || 'yearly',
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '',
    description: job.description || '',
    requirements: job.requirements || '',
    responsibilities: job.responsibilities || '',
    benefits: job.benefits || ''
  })
  const [saving, setSaving] = useState(false)

  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.company.trim() || !form.location.trim() || !form.category) {
      toast.error('Title, company, location, category and description are required')
      return
    }
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      toast.error('Minimum salary cannot be greater than maximum salary')
      return
    }
    try {
      setSaving(true)
      await api.put(`/jobs/${job.id}`, {
        ...form,
        salaryMin: form.salaryMin === '' ? null : parseInt(form.salaryMin),
        salaryMax: form.salaryMax === '' ? null : parseInt(form.salaryMax),
        applicationDeadline: form.applicationDeadline || null
      })
      toast.success('Job updated successfully!')
      onSaved()
    } catch (error) {
      // api interceptor surfaces the message
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Edit job &mdash; {job.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job title</label>
              <input className="input w-full" value={form.title} onChange={(e) => change('title', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input className="input w-full" value={form.company} onChange={(e) => change('company', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input className="input w-full" value={form.location} onChange={(e) => change('location', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="select w-full" value={form.category} onChange={(e) => change('category', e.target.value)} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job type</label>
              <select className="select w-full" value={form.jobType} onChange={(e) => change('jobType', e.target.value)}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience level</label>
              <select className="select w-full" value={form.experienceLevel} onChange={(e) => change('experienceLevel', e.target.value)}>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input className="input w-full" value={form.industry} onChange={(e) => change('industry', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application deadline</label>
              <input type="date" className="input w-full" value={form.applicationDeadline} onChange={(e) => change('applicationDeadline', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min salary</label>
              <input type="number" min="0" className="input w-full" value={form.salaryMin} onChange={(e) => change('salaryMin', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max salary</label>
              <input type="number" min="0" className="input w-full" value={form.salaryMax} onChange={(e) => change('salaryMax', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary type</label>
              <select className="select w-full" value={form.salaryType} onChange={(e) => change('salaryType', e.target.value)}>
                {SALARY_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={4} className="textarea w-full" value={form.description} onChange={(e) => change('description', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea rows={3} className="textarea w-full" value={form.requirements} onChange={(e) => change('requirements', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
            <textarea rows={3} className="textarea w-full" value={form.responsibilities} onChange={(e) => change('responsibilities', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
            <textarea rows={2} className="textarea w-full" value={form.benefits} onChange={(e) => change('benefits', e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobFormModal
