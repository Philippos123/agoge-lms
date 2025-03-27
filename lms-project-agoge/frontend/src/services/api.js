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
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));


// Response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await AuthService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        AuthService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


// Authentication service
const AuthService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/token/', { email, password });
      if (response.data.access) {
        // Spara användardata först
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,
          email: response.data.email,
          isAdmin: response.data.is_admin,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          companyId: response.data.company_id,
          companyName: response.data.company_name
        }));
        
        // Spara tokens
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Omdirigera till dashboard eller annan lämplig sida
        window.location.href = "/dashboard";
      }
    } catch (error) {
      throw error;
    }
  },
  

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); // Ta bort även refreshToken
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
      // Om settings är en FormData, använd den direkt
      if (settings instanceof FormData) {
        const response = await axios.put(`${API_URL}/dashboard-settings/`, settings, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        return response.data;
      } else {
        // Annars, använd vanlig JSON
        const response = await api.put('/dashboard-settings/', settings);
        return response.data;
      }
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

export const getFullMediaUrl = (relativeUrl) => {
  if (!relativeUrl) return '/default-profile.jpg';
  
  // Om URL:en redan är absolut (börjar med http/https) 
  if (relativeUrl.startsWith('http') ) {
    return relativeUrl;
  }
  
  // Annars, lägg till bas-URL:en
  return `http://localhost:8000${relativeUrl}`;
};


// Exportera ModuleService


export const CourseService = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
};


export { AuthService, DashboardService };
export default api;


