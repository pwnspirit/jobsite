import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Search, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

function Home() {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: Search,
      title: 'Smart Job Search',
      description: 'Find jobs that match your skills and experience with our intelligent matching algorithm.'
    },
    {
      icon: Briefcase,
      title: 'Easy Applications',
      description: 'Apply to multiple jobs with just a few clicks. Track your application status in real-time.'
    },
    {
      icon: Users,
      title: 'Recruiter Tools',
      description: 'Post jobs, manage applications, and find the perfect candidates for your company.'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Access resources and tools to advance your career and develop new skills.'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security and privacy controls.'
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: 'Built with modern technology for a smooth and responsive user experience.'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Active Jobs' },
    { number: '50,000+', label: 'Job Seekers' },
    { number: '5,000+', label: 'Companies' },
    { number: '95%', label: 'Success Rate' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Dream Job
              <span className="block text-primary-200">Or Hire the Best Talent</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Connect with opportunities that match your skills and aspirations. 
              Whether you're looking for your next career move or building your team, 
              JobSite is your trusted partner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/jobs"
                    className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8"
                  >
                    Browse Jobs
                  </Link>
                </>
              ) : (
                <Link
                  to="/jobs"
                  className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8"
                >
                  Find Jobs
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose JobSite?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the tools and platform you need to succeed in your career journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-soft hover:shadow-medium transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and build your professional profile with skills, experience, and resume.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Find Opportunities</h3>
              <p className="text-gray-600">
                Search and filter through thousands of job opportunities that match your criteria.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply & Connect</h3>
              <p className="text-gray-600">
                Apply to jobs with one click and connect with recruiters and hiring managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs through JobSite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/jobs"
                  className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8"
                >
                  Browse Jobs
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 