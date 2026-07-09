import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong';
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    
    // Handle forbidden errors
    else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }
    
    // Handle validation errors
    else if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      if (Array.isArray(validationErrors)) {
        validationErrors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(message);
      }
    }
    
    // Handle other errors
    else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout'
  },
  
  // Jobs
  jobs: {
    list: '/jobs',
    detail: (id) => `/jobs/${id}`,
    create: '/jobs',
    update: (id) => `/jobs/${id}`,
    delete: (id) => `/jobs/${id}`,
    myJobs: '/jobs/my-jobs'
  },
  
  // Applications
  applications: {
    create: '/applications',
    list: '/applications',
    myApplications: '/applications/my-applications',
    jobApplications: (jobId) => `/applications/job/${jobId}`,
    updateStatus: (id) => `/applications/${id}/status`,
         withdraw: (id) => `/applications/${id}/withdraw`
  },
  
  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    uploadResume: '/users/resume',
    skills: '/users/skills',
    bookmarks: '/users/bookmarks',
    dashboard: '/users/dashboard'
  },
  
  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    jobs: '/admin/jobs',
    skills: '/admin/skills',
    reports: '/admin/reports'
  }
};

export const apiHelpers = {
  // Helper for paginated data
  getPaginatedData: async (url, params = {}) => {
    const response = await api.get(url, { params });
    return {
      data: response.data.data,
      pagination: {
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems,
        hasNext: response.data.hasNext,
        hasPrev: response.data.hasPrev
      }
    };
  },

  // Helper for creating resources
  createResource: async (url, data) => {
    const response = await api.post(url, data);
    return response.data;
  },

  // Helper for updating resources
  updateResource: async (url, data) => {
    const response = await api.put(url, data);
    return response.data;
  },

  // Helper for deleting resources
  deleteResource: async (url) => {
    const response = await api.delete(url);
    return response.data;
  },

  // Helper for file uploads
  uploadFile: async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    return response.data;
  }
};

export default api; 
