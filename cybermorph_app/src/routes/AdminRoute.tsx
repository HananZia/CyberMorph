import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Prevent redirect flicker while auth is initializing
  if (isLoading) return null; // or a spinner component

  // Not logged in → go home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Logged in but not admin → send to dashboard
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
