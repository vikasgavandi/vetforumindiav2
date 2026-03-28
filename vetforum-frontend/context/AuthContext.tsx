
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

// Use localhost for development, production URL for deployed
import { API_BASE_URL } from '../src/config';

// Use centralized configuration
const API_BASE = API_BASE_URL;

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole, password: string) => Promise<boolean>;
  authError?: string | null;
  clearAuthError?: () => void;
  logout: () => void;
  register: (userData: any, otp?: string) => Promise<{ success: boolean; error?: string }>;
  requestOtp: (email: string, firstName: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updatedData: any) => Promise<{ success: boolean; error?: string }>;
  uploadProfilePhoto: (file: File) => Promise<{ success: boolean; error?: string }>;
  deleteProfilePhoto: () => Promise<{ success: boolean; error?: string }>;
  fetchProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('vet_app_user');
    const token = localStorage.getItem('auth_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchProfile();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: UserRole, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE}/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: role }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `Login failed (${response.status})`;
        setAuthError(errorMessage);
        return false;
      }

      if (data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('vet_app_user', JSON.stringify(data.user));
        localStorage.setItem('auth_token', data.token);
        setAuthError(null);
        return true;
      }

      const fallbackError = data?.error || 'Login failed';
      setAuthError(fallbackError);
      return false;
    } catch (error) {
      console.error("Login Error:", error);
      const message = error instanceof Error ? error.message : 'Network error occurred';
      setAuthError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('vet_app_user');
    localStorage.removeItem('auth_token');
  };

  const register = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Add all user data to FormData
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          if (key === 'document' && userData[key] instanceof File) {
            formData.append(key, userData[key]);
          } else {
            formData.append(key, userData[key].toString());
          }
        }
      });

      const response = await fetch(`${API_BASE}/authentication/register`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `Registration failed (${response.status})`;
        return { success: false, error: errorMessage };
      }

      // Update local state and storage
      setUser(responseData.user || responseData);
      localStorage.setItem('vet_app_user', JSON.stringify(responseData.user || responseData));
      if (responseData.token) {
        localStorage.setItem('auth_token', responseData.token);
      }

      return { success: true };
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Network error occurred";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async (email: string, firstName: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE}/authentication/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || `OTP request failed (${response.status})`;
        setAuthError(errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error("OTP Request Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Network error occurred";
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/authentication/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('vet_app_user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const updateUser = async (updatedData: any): Promise<{ success: boolean; error?: string }> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return { success: false, error: 'No authentication token' };

    try {
      const response = await fetch(`${API_BASE}/authentication/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || 'Update failed';
        return { success: false, error: errorMessage };
      }

      setUser(responseData.user);
      localStorage.setItem('vet_app_user', JSON.stringify(responseData.user));
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const uploadProfilePhoto = async (file: File): Promise<{ success: boolean; error?: string }> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return { success: false, error: 'No authentication token' };

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${API_BASE}/authentication/profile/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || 'Upload failed';
        return { success: false, error: errorMessage };
      }

      setUser(responseData.user);
      localStorage.setItem('vet_app_user', JSON.stringify(responseData.user));
      return { success: true };
    } catch (error) {
      console.error('Photo upload error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const deleteProfilePhoto = async (): Promise<{ success: boolean; error?: string }> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return { success: false, error: 'No authentication token' };

    try {
      const response = await fetch(`${API_BASE}/authentication/profile/delete-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || 'Delete failed';
        return { success: false, error: errorMessage };
      }

      setUser(responseData.user);
      localStorage.setItem('vet_app_user', JSON.stringify(responseData.user));
      return { success: true };
    } catch (error) {
      console.error('Photo delete error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, requestOtp, updateUser, uploadProfilePhoto, deleteProfilePhoto, fetchProfile, isLoading, authError, clearAuthError: () => setAuthError(null) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
