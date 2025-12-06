import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, loading, user } = useContext(AuthContext);
  const userRoles = user?.roles?.map(r => r.authority) || [];

  if (loading) {
    return <div>Loading...</div>; // bisa diganti spinner
  }

  // Jika tidak ada token → arahkan ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
    // user login tapi tidak punya role yang diizinkan
    return <Navigate to="/unauthorized" replace />;
  }

  // Jika sudah login → tampilkan halaman
  return children;
};

export default ProtectedRoute;
