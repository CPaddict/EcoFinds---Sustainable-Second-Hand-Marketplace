// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, profileImage?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>; // For now, profile image update is URL based
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const handleAuthSuccess = (responseData: { access_token: string; refresh_token?: string; user: User }) => {
    api.utils.setTokens(responseData.access_token, responseData.refresh_token);
    setCurrentUser(responseData.user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(responseData.user));
  };

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    const token = api.utils.getToken();
    if (token) {
      const response = await api.getMe(); 
      if (response && !response.error && (response as User).id) {
        const userData = response as User;
        setCurrentUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } else {
        const newAccessToken = await api.utils.refreshToken();
        if (newAccessToken) {
          const refreshedResponse = await api.getMe();
          if (refreshedResponse && !refreshedResponse.error && (refreshedResponse as User).id) {
            const refreshedUserData = refreshedResponse as User;
            setCurrentUser(refreshedUserData);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(refreshedUserData));
          } else {
            api.utils.removeTokens(); setIsAuthenticated(false); setCurrentUser(null);
          }
        } else {
          api.utils.removeTokens(); setIsAuthenticated(false); setCurrentUser(null);
        }
      }
    } else {
       setIsAuthenticated(false); setCurrentUser(null);
       localStorage.removeItem('currentUser'); // Ensure no stale user if no token
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    const handleAuthError = () => {
      logout(); 
      toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [fetchCurrentUser]); // logout is stable due to useCallback

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const apiLoginResponse = await api.login({ email, password });
    setIsLoading(false);
    if (apiLoginResponse && apiLoginResponse.access_token && apiLoginResponse.user) {
      handleAuthSuccess(apiLoginResponse as { access_token: string; refresh_token?: string; user: User });
      toast({ title: "Login successful", description: `Welcome back, ${apiLoginResponse.user.username}!` });
      return true;
    } else {
      toast({ title: "Login failed", description: String(apiLoginResponse.error || "Invalid email or password."), variant: "destructive" });
      return false;
    }
  };

  const register = async (email: string, username: string, password: string, profileImage?: string): Promise<boolean> => {
    setIsLoading(true);
    const userData = { email, username, password, profileImage };
    const apiRegisterResponse = await api.register(userData);
    setIsLoading(false);
    if (apiRegisterResponse && apiRegisterResponse.access_token && apiRegisterResponse.user) {
      handleAuthSuccess(apiRegisterResponse as { access_token: string; refresh_token?: string; user: User });
      toast({ title: "Registration successful", description: `Welcome to EcoFinds, ${apiRegisterResponse.user.username}!` });
      return true;
    } else {
      toast({ title: "Registration failed", description: String(apiRegisterResponse.error || "Could not create account."), variant: "destructive" });
      return false;
    }
  };

  const logout = useCallback(() => {
    api.utils.removeTokens();
    setCurrentUser(null);
    setIsAuthenticated(false);
    // No need to call api.logout() if it's just client-side token removal
    toast({ title: "Logged out", description: "You have been logged out successfully." });
  }, [toast]);

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!isAuthenticated) return false;
    setIsLoading(true);
    const apiUpdateResponse = await api.updateProfile(userData); // Expects User or { error: ... }
    setIsLoading(false);
    if (apiUpdateResponse && !apiUpdateResponse.error && (apiUpdateResponse as User).id) {
      const updatedUser = apiUpdateResponse as User;
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast({ title: "Profile updated", description: "Your profile has been updated successfully." });
      return true;
    } else {
      toast({ title: "Update failed", description: String(apiUpdateResponse.error || "Failed to update profile."), variant: "destructive" });
      return false;
    }
  };

  const value = {
    currentUser, isAuthenticated, isLoading, login, register, logout, updateProfile, fetchCurrentUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) { throw new Error("useAuth must be used within an AuthProvider"); }
  return context;
};
