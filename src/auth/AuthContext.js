import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, refreshToken, getUserProfile } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user data in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin({ email, password });
      
      // Get additional user info including admin status
      const userProfile = await getUserProfile();
      
      const userData = { 
        email, 
        token: response.data.access, 
        refreshToken: response.data.refresh,
        isAdmin: userProfile.data.is_admin || userProfile.data.is_staff || false,
        id: userProfile.data.id
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state which triggers re-render
      setUser(userData);
      
      // Navigate after state is updated
      navigate('/');
      
      return { success: true };
    } catch (error) {
      console.error("Login error in context:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const refreshUserToken = async () => {
    if (user?.refreshToken) {
      try {
        const response = await refreshToken(user.refreshToken);
        
        // Update user data in localStorage with new tokens
        const updatedUser = { 
          ...user, 
          token: response.data.access,
          refreshToken: response.data.refresh 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update state
        setUser(updatedUser);
        return true;
      } catch (error) {
        // If refresh fails, log out the user
        logout();
        return false;
      }
    }
    return false;
  };

  const value = {
    user,
    login,
    logout,
    refreshUserToken,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}