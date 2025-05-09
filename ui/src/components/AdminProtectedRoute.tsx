import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = ({ requiredRole }: { requiredRole?: string }) => {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the user is admin, redirect to a different page (like /admin_dashboard or similar)
  if (role != "admin") {
    return <Navigate to="/admin/login" replace />; // Adjust this to your desired route
  }

  // If everything is fine, render the outlet (for nested routes)
  return <Outlet />;
};

export default AdminProtectedRoute;
