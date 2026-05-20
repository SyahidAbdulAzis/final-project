import { Navigate } from 'react-router-dom';
import type { JSX } from 'react';

type ProtectedRouteProps = {
  allowed: boolean;
  children: JSX.Element;
};

export function ProtectedRoute({ allowed, children }: ProtectedRouteProps) {
  return allowed ? children : <Navigate to="/" replace />;
}
