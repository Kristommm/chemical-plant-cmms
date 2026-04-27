import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Ensure this path points to your new api.js file

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cmms_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const parseJwt = (t) => {
    try { return JSON.parse(atob(t.split('.')[1])); } 
    catch (e) { return null; }
  };

  const fetchUserProfile = async (authToken) => {
    const payload = parseJwt(authToken);
    if (!payload || !payload.sub) return logout();

    try {
      // Axios interceptor automatically attaches the token here!
      const response = await api.get(`/users/${payload.sub}`);
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      logout(); // If the token is expired/invalid, Axios throws an error and we log them out
    } finally {
      setIsLoading(false);
    }
  };

  // Run on initial load to restore session if token exists
  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    // FastAPI's OAuth2 still expects URL-encoded data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      // Axios detects URLSearchParams and auto-sets the headers!
      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      setToken(access_token);
      
      // We set localStorage immediately so the api interceptor can use it on the next line
      localStorage.setItem('cmms_token', access_token);
      
      await fetchUserProfile(access_token);
      navigate('/');
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cmms_token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};