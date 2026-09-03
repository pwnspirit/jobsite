# Job Site Platform

A full-stack job site platform built with React, Node.js, Express, and MySQL. This platform allows job seekers to find and apply for jobs, and recruiters to post and manage job listings.

## ⚡ Quick start

Make sure MySQL/MariaDB is running, then from the project root:

```bash
./run.sh
```

The script checks Node/npm, verifies (or creates) the database, installs dependencies, seeds demo data if the DB is empty, and starts both servers:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

Use `./run.sh --fresh` to rebuild the schema and reload sample data. Demo logins are printed on start (admin `admin@jobsite.com` / `admin123`).

## 🚀 Features

### Job Seeker Module
- **Authentication**: Sign up/Login with JWT-based sessions
- **Profile Management**: Create and update profile with resume upload
- **Job Search**: Search jobs by keyword, location, and various filters
- **Job Applications**: Apply for jobs with cover letter option
- **Bookmarks**: Save and organize favorite jobs
- **Application Tracking**: Monitor application status and history
- **Notifications**: Get alerts for job suggestions and updates

### Employer/Recruiter Module
- **Job Posting**: Create and manage job listings
- **Application Management**: Review and manage job applications
- **Candidate Communication**: Contact applicants through the platform
- **Dashboard**: View job statistics and application overview

### Admin Panel
- **User Management**: Approve/ban user accounts
- **Job Moderation**: Approve/reject job postings
- **System Statistics**: Monitor platform usage and performance
- **Content Management**: Manage skills and categories

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live notifications and status updates
- **File Upload**: Secure resume upload system
- **Search & Filters**: Advanced job search with multiple criteria
- **Pagination**: Efficient data loading for large datasets
- **Security**: JWT authentication, input validation, and rate limiting

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **Sequelize** - Object-Relational Mapping (ORM)
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Express Validator** - Input validation

### Database
- **MySQL** - Primary database
- **Sequelize** - Database ORM with migrations
- **Indexes** - Optimized queries for performance

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd job-site-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=job_site_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Database Setup

#### Option 1: Automatic Setup (Recommended)

```bash
# From the root directory
npm run setup-db
```

#### Option 2: Manual Setup

1. Create a MySQL database:
```sql
CREATE DATABASE job_site_db;
```

2. Run the setup script:
```bash
cd backend
npm run setup-db
```

### 5. Seed Sample Data

```bash
# From the root directory
npm run seed
```

This will populate the database with:
- Sample users (job seekers, recruiters, admin)
- Sample skills and job categories
- Sample job postings
- Sample notifications

### 6. Start the Application

#### Development Mode (Both Frontend and Backend)

```bash
# From the root directory
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Individual Services

```bash
# Start only the backend
npm run server

# Start only the frontend
npm run client

# Build frontend for production
npm run build
```

## 🔑 Default Accounts

After seeding the database, you can use these test accounts:

### Admin Account
- **Email**: admin@jobsite.com
- **Password**: admin123

### Job Seeker Account
- **Email**: john.doe@example.com
- **Password**: password123

### Recruiter Account
- **Email**: sarah.wilson@example.com
- **Password**: password123

## 📁 Project Structure

```
job-site-platform/
├── backend/                 # Backend Node.js application
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication and validation middleware
│   ├── models/             # Sequelize database models
│   ├── routes/             # API route handlers
│   ├── scripts/            # Database setup and seeding scripts
│   ├── uploads/            # File upload directory
│   ├── .env                # Environment variables
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
├── frontend/               # Frontend React application
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # React entry point
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── vite.config.js      # Vite build configuration
├── package.json            # Root package.json with scripts
└── README.md               # This file
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Jobs
- `GET /api/jobs` - List jobs with filters and pagination
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create new job (recruiters only)
- `PUT /api/jobs/:id` - Update job (owner/admin only)
- `DELETE /api/jobs/:id` - Deactivate job (owner/admin only)

### Applications
- `POST /api/applications` - Apply for a job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applications for a job (recruiters)
- `PUT /api/applications/:id/status` - Update application status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/resume` - Upload resume
- `GET /api/users/skills` - Get user skills
- `POST /api/users/skills` - Add skill to user

### Admin
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/jobs` - List all jobs
- `PUT /api/admin/jobs/:id/approval` - Approve/reject jobs

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Colors in `frontend/tailwind.config.js`
- Component styles in `frontend/src/index.css`
- Individual component styling

### Database Schema
Database models are defined in `backend/models/`. You can:
- Add new fields to existing models
- Create new models for additional features
- Modify relationships between models

### API Routes
API endpoints are organized in `backend/routes/`. You can:
- Add new routes for additional functionality
- Modify existing route handlers
- Add new middleware for authentication or validation

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in your environment variables
2. Use a process manager like PM2: `pm2 start server.js`
3. Set up a reverse proxy (Nginx/Apache) for SSL termination
4. Configure environment variables for production

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the `dist` folder with a web server
3. Configure your web server to handle React Router (SPA routing)

### Database Deployment
1. Use a managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
2. Set up automated backups
3. Configure connection pooling for production loads

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

### Future Features
- **Real-time Chat**: Direct messaging between applicants and recruiters
- **Video Interviews**: Integrated video calling for remote interviews
- **AI Job Matching**: Machine learning-based job recommendations
- **Mobile App**: Native mobile applications for iOS and Android
- **Analytics Dashboard**: Advanced reporting and insights
- **Integration APIs**: Connect with external HR systems and job boards

### Performance Improvements
- **Caching**: Redis implementation for better performance
- **CDN**: Content delivery network for static assets
- **Database Optimization**: Query optimization and indexing
- **Load Balancing**: Horizontal scaling for high traffic

---

**Built with ❤️ for modern job searching and recruitment** 