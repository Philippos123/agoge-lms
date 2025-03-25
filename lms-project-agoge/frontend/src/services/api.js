import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
console.log(localStorage.getItem('token')); // Kontrollera om token finns här


// Authentication service
const AuthService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/token/', { email, password });
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);  // Spara refresh token ✅
        
        // Spara användardata i localStorage
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,
          email: response.data.email,
          isAdmin: response.data.is_admin,  // Kontrollera att 'is_admin' finns i response.data
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          companyId: response.data.company_id,
          companyName: response.data.company_name
        }));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await api.post('/token/refresh/', {
        refresh: refreshToken,
      });
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
      }
      return response.data;
    } catch (error) {
      AuthService.logout();
      throw error;
    }
  },
};



// Dashboard service
const DashboardService = {
  // Get dashboard settings
  getSettings: async () => {
    try {
      const response = await api.get('/dashboard-settings/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update dashboard settings (admin only)
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/dashboard-settings/', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Hämta alla kurser
export const getCourses = async () => {
  const response = await fetch(`${API_URL}/coursetobuy/`);
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  return response.json();
};

// Hämta en specifik kurs
export const getCourse = async (courseId) => {
  const response = await fetch(`${API_URL}/coursetobuy/${courseId}/`);
  if (!response.ok) {
    throw new Error("Failed to fetch course");
  }
  return response.json();
};

// Lägg till en kurs
export const createCourse = async (courseData) => {
  const response = await fetch(`${API_URL}/coursetobuy/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    throw new Error("Failed to create course");
  }
  return response.json();
};

// Uppdatera en kurs
export const updateCourse = async (courseId, courseData) => {
  const response = await fetch(`${API_URL}/coursetobuy/${courseId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    throw new Error("Failed to update course");
  }
  return response.json();
};



export const CourseService = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
};
export { AuthService, DashboardService };
export default api;