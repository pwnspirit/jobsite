import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin } from 'lucide-react'

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim() || location.trim()) {
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append('search', searchTerm.trim())
      if (location.trim()) params.append('location', location.trim())
      
      navigate(`/jobs?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center bg-white border border-gray-300 rounded-lg sm:rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 overflow-hidden">
        {/* Search Input */}
        <div className="flex-1 flex items-center px-3 min-w-0">
          <Search className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0 w-full py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Divider */}
        <div className="h-px sm:h-6 sm:w-px w-full bg-gray-300 shrink-0"></div>

        {/* Location Input */}
        <div className="flex-1 flex items-center px-3 min-w-0">
          <MapPin className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="City, state, or remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 min-w-0 w-full py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full sm:w-auto bg-primary-600 text-white px-6 py-2 sm:rounded-r-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shrink-0"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar 
 