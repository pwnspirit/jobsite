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
      <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
        {/* Search Input */}
        <div className="flex-1 flex items-center px-3">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Location Input */}
        <div className="flex-1 flex items-center px-3">
          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="City, state, or remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-primary-600 text-white px-6 py-2 rounded-r-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar 
 