import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../services/authStorage.js";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

