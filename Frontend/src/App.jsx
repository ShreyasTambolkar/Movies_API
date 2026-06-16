import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Register from "./pages/Register/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleRegisterSuccess = (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Login onLoginSuccess={handleLoginSuccess} />
        }
      />
      <Route
        path="/register"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Register onRegisterSuccess={handleRegisterSuccess} />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;