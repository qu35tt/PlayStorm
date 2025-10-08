import { type JSX, type ReactNode } from 'react';
import { Navigate } from 'react-router';

type PrivateRouteProps = {
  children: ReactNode;
};

export const PrivateRoute = ({ children }: PrivateRouteProps): JSX.Element => {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));
      
  if (isAuthenticated) {
    return <>{children}</>;
  }
    
  return <Navigate to="/" />;
}