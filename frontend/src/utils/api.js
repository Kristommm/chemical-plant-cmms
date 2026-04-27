import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cmms_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) AND we haven't already tried to refresh this exact request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Mark this request so we don't end up in an infinite retry loop
      originalRequest._retry = true; 

      try {
        // Ask the backend for a new token (the cookie is sent automatically)
        const refreshResponse = await api.post('/refresh');
        
        // Grab the brand new 15-minute token
        const newAccessToken = refreshResponse.data.access_token;
        
        // Save it to localStorage so future requests use it
        localStorage.setItem('cmms_token', newAccessToken);
        
        // Swap out the dead token in the failed request's header for the new one
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Replay the original request with the new key!
        return api(originalRequest);
        
      } catch (refreshError) {
        // If the refresh request itself fails (e.g., the 7-day cookie expired or is missing)
        // It's time for a hard logout.
        localStorage.removeItem('cmms_token');
        
        // We use window.location here because we are outside of a React component context
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }
    
    // If it's any other error (like a 400 Bad Request or 404 Not Found), just pass it down to the component
    return Promise.reject(error);
  }
);

export default api;