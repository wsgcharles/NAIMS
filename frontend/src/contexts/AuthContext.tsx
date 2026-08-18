import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CurrentUser, LoginRequest } from '../types';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<CurrentUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The backend issues the role claim under the long ASP.NET ClaimTypes.Role URI
const ROLE_CLAIM_URI = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('educore_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('educore_token');
      const storedUser = localStorage.getItem('educore_user');

      if (storedToken) {
        try {
          const decodedToken: any = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            authService.logout();
            setToken(null);
            setUser(null);
          } else {
            setToken(storedToken);
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch {
                setUser(null);
              }
            } else {
              const decodedRole = decodedToken[ROLE_CLAIM_URI] || decodedToken.role || 'Teacher';
              const fallbackUser: CurrentUser = {
                id: decodedToken.sub || decodedToken.nameid || '0',
                email: decodedToken.email || '',
                role: decodedRole,
                fullName: decodedToken.email || '',
                firstName: decodedToken.given_name || '',
                lastName: decodedToken.family_name || '',
                mustChangePassword: false,
                isActive: true,
              };
              setUser(fallbackUser);
              localStorage.setItem('educore_user', JSON.stringify(fallbackUser));
            }

            // Refresh user profile asynchronously from GET /api/auth/me to ensure live dynamic DB data
            authService.getCurrentUser().then((me) => {
              const updatedUser: CurrentUser = {
                id: me.id.toString(),
                email: me.email,
                role: me.role as any,
                fullName: me.fullName,
                firstName: me.firstName,
                lastName: me.lastName,
                mustChangePassword: me.mustChangePassword,
                isActive: true,
              };
              setUser(updatedUser);
              localStorage.setItem('educore_user', JSON.stringify(updatedUser));
            }).catch(() => {});
          }
        } catch {
          authService.logout();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<CurrentUser> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const decodedToken: any = jwtDecode(response.token);
      const decodedRole = (decodedToken[ROLE_CLAIM_URI] || decodedToken.role || response.role || 'Teacher') as any;

      const loggedInUser: CurrentUser = {
        id: response.userId.toString(),
        email: response.email,
        role: decodedRole,
        fullName: response.fullName || response.email,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        mustChangePassword: response.mustChangePassword,
        isActive: true,
      };

      setToken(response.token);
      setUser(loggedInUser);
      localStorage.setItem('educore_token', response.token);
      localStorage.setItem('educore_user', JSON.stringify(loggedInUser));

      setIsLoading(false);
      return loggedInUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    try {
      localStorage.removeItem('educore_token');
      localStorage.removeItem('educore_user');
      localStorage.removeItem('educore_permissions');
      sessionStorage.clear();
    } catch {}
    setToken(null);
    setUser(null);
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
