//PrivateAdminRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateAdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.type !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
