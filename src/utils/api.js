import axios from 'axios';


const API_URL = 'https://my.vivionix.com';
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to check if session is expired
const isSessionExpired = () => {
  const lastActivity = localStorage.getItem('lastActivityTime');
  if (!lastActivity) return true;
  
  const currentTime = new Date().getTime();
  return currentTime - parseInt(lastActivity) > SESSION_TIMEOUT;
};

// Function to update last activity time
const updateLastActivity = () => {
  localStorage.setItem('lastActivityTime', new Date().getTime().toString());
};

// Function to handle logout
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('lastActivityTime');
  window.location.href = '/';
};

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Check for session expiry before each request
    if (isSessionExpired()) {
      logout();
      return Promise.reject(new Error('Session expired'));
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Update last activity time
    updateLastActivity();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Update last activity time on successful response
    updateLastActivity();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/employee/token/refresh/`, {
          refresh: refreshToken
        });

        if (response.data && response.data.access) {
          // Update the access token
          localStorage.setItem('access_token', response.data.access);
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          // Update last activity time after successful token refresh
          updateLastActivity();
          
          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh token is invalid, logout the user
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/employee/login/`, {
      email: email,
      password: password
    });

    const { access, refresh, ...userData } = response.data;

    if (!access || !refresh) {
      throw new Error('No tokens received from server');
    }

    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Set initial last activity time on login
    updateLastActivity();

    return {
      ...userData,
      access,
      refresh
    };
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error('Error setting up login request');
    }
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_URL}/employee/token/refresh/`, {
      refresh: refreshToken
    });

    if (response.data && response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      updateLastActivity();
      return response.data;
    } else {
      throw new Error('Invalid refresh token response');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    logout();
    throw error;
  }
};

export default api; 