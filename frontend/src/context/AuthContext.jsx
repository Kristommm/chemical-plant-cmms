import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cmms_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to parse the JWT payload without needing an external library
  const parseJwt = (t) => {
    try { return JSON.parse(atob(t.split('.')[1])); } 
    catch (e) { return null; }
  };

  const fetchUserProfile = async (authToken) => {
    const payload = parseJwt(authToken);
    if (!payload || !payload.sub) return logout();

    try {
      const response = await fetch(`http://localhost:8000/users/${payload.sub}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
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
    // FastAPI's OAuth2 expects URL-encoded form data, NOT JSON!
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    if (!response.ok) throw new Error('Invalid credentials');

    const data = await response.json();
    setToken(data.access_token);
    localStorage.setItem('cmms_token', data.access_token);
    
    // Fetch the user's name and role using the new token
    await fetchUserProfile(data.access_token);
    navigate('/');
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