import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CurrentUser, LoginRequest, UserRoleString } from '../types';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<CurrentUser>;
  logout: () => void;
  setMockRole: (role: UserRoleString) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The backend issues the role claim under the long ASP.NET ClaimTypes.Role URI
// (see EduCore.API/Services/JwtService.cs), not a short "role" key.
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
        setToken(storedToken);
        let hasStoredUser = false;
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            hasStoredUser = true;
          } catch {
            localStorage.removeItem('educore_user');
          }
        }
        try {
          // Prefer the real, authoritative profile whenever the backend is reachable.
          const me = await authService.getCurrentUser();
          setUser(me);
          localStorage.setItem('educore_user', JSON.stringify(me));
        } catch {
          // /auth/me failed (backend offline, transient error, expired token).
          // If a valid session was already restored from storage above, trust it —
          // do NOT overwrite an already-known role with a guess or a fabricated user.
          if (!hasStoredUser) {
            try {
              const decoded: any = jwtDecode(storedToken);
              const fallbackUser: CurrentUser = {
                id: decoded.UserId || decoded.sub || 'usr-1',
                email: decoded.email || 'user@educore.edu',
                role: decoded[ROLE_CLAIM_URI] as UserRoleString,
                mustChangePassword: decoded.MustChangePassword === 'true',
                isActive: true,
              };
              if (fallbackUser.role) {
                setUser(fallbackUser);
                localStorage.setItem('educore_user', JSON.stringify(fallbackUser));
              } else {
                // Token decoded but carries no recognizable role claim — fail closed.
                logout();
              }
            } catch {
              // Token isn't a parseable JWT at all — fail closed rather than
              // guessing a role. A failed session must remain a failed session.
              logout();
            }
          }
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
      setToken(response.token);
      localStorage.setItem('educore_token', response.token);

      const loggedInUser: CurrentUser = {
        id: response.userId,
        email: response.email,
        role: response.role as UserRoleString,
        mustChangePassword: response.mustChangePassword,
        isActive: true,
      };

      setUser(loggedInUser);
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
    setToken(null);
    setUser(null);
  };

  // Demo tool to quickly preview all 5 role portals
  const setMockRole = (role: UserRoleString) => {
    const mockUser: CurrentUser = {
      id: 'mock-id',
      email: `${role.toLowerCase()}@noahsacademy.edu`,
      role: role,
      firstName: 'Demo',
      lastName: role,
      mustChangePassword: false,
      isActive: true,
    };
    setUser(mockUser);
    localStorage.setItem('educore_user', JSON.stringify(mockUser));
    localStorage.setItem('educore_token', 'mock-token-demo');
    setToken('mock-token-demo');
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
        setMockRole,
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
