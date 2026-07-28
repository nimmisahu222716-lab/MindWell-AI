import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_BASE_URL = 'http://127.0.0.1:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [profileImage, setProfileImage] = useState(null);

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle loading and saving user-specific profile image
  useEffect(() => {
    if (user && user.email) {
      const savedImg = localStorage.getItem(`profile_image_${user.email}`);
      setProfileImage(savedImg || null);
    } else {
      setProfileImage(null);
    }
  }, [user]);

  const uploadProfileImage = (base64String) => {
    if (user && user.email) {
      localStorage.setItem(`profile_image_${user.email}`, base64String);
      setProfileImage(base64String);
      return true;
    }
    return false;
  };

  const deleteProfileImage = () => {
    if (user && user.email) {
      localStorage.removeItem(`profile_image_${user.email}`);
      setProfileImage(null);
      return true;
    }
    return false;
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Configure axios defaults with token
  const getApiClient = () => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
    });
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return instance;
  };

  // Fetch user profile on startup or when token changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const client = getApiClient();
        const response = await client.get('/profile/');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // If token is invalid or expired
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const sendOtp = async (fullName, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        full_name: fullName,
        email,
        password,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to send OTP';
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid or expired OTP';
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Email not registered';
      return { success: false, error: message };
    }
  };

  const verifyResetOtp = async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-reset-otp`, {
        email,
        otp,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid or expired OTP';
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        new_password: newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Please verify OTP first';
      return { success: false, error: message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const client = getApiClient();
      const response = await client.put('/profile/', profileData);
      // Fetch updated profile
      const updatedProfile = await client.get('/profile/');
      setUser(updatedProfile.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update profile';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        profileImage,
        uploadProfileImage,
        deleteProfileImage,
        toggleTheme,
        login,
        logout,
        sendOtp,
        verifyOtp,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        updateProfile,
        getApiClient,
        apiBaseUrl: API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
