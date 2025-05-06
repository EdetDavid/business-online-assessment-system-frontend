import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import AssessmentStats from "./components/AssessmentStats";
import UserManagement from "./components/UserManagement";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AssessmentPage from "./pages/AssessmentPage";
import ResultsPage from "./pages/ResultsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAssessmentPage from "./pages/AdminAssessmentPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import { fetchCsrfToken } from "./services/api";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    // Add an emoji icon to the document title
    document.title = '📊 Business Assessment';
  }, []);

  // Generate theme based on dark/light mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#1976d2",
          },
          secondary: {
            main: "#dc004e",
          },
        },
      }),
    [darkMode]
  );

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Navbar toggleTheme={toggleTheme} isDarkMode={darkMode} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/assessment/:id" element={<AssessmentPage />} />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin={false}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/assessments"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminAssessmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assessments/:id"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminAssessmentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/stats"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AssessmentStats />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProfilePage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
