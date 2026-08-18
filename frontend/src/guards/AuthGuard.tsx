import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NoahLogo } from '../components/brand/NoahLogo';
import { jwtDecode } from 'jwt-decode';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen sidebar-purple-gradient flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <NoahLogo size="lg" showText={true} lightText={true} />
          <div className="w-8 h-8 border-4 border-amber-300 border-t-transparent rounded-full animate-spin mt-2" />
          <span className="text-xs font-semibold text-purple-200">Verifying Noah's Academy Session...</span>
        </div>
      </div>
    );
  }

  // Client-side JWT expiration check
  let isTokenExpired = false;
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        isTokenExpired = true;
      }
    } catch {
      isTokenExpired = true;
    }
  }

  if (!isAuthenticated || isTokenExpired) {
    const fromState = location.pathname !== '/403' && location.pathname !== '/login' ? { from: location } : undefined;
    return <Navigate to="/login" state={fromState} replace />;
  }

  return <>{children}</>;
};
