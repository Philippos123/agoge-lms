import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './pages/Dashboard'; // Här ändrar vi importen till den nya platsen
import { AuthService } from './services/api';
import Market from './pages/market'; // Justera sökvägen för market-importen
import CourseToBuyDetail from './pages/CourseToBuyDetail';
import Team from './pages/Team';
import CourseDashboard from './pages/CourseDashboard';
import { ThemeProvider } from './context/ThemeContext';
import CompanyCourses from './pages/CourseDashboard';
import CourseEditor from './components/CreateCourse';
import TestEditor from './pages/test'



const ProtectedRoute = ({ children }) => {
  const isLoggedIn = AuthService.isLoggedIn();
  
  console.log('ProtectedRoute - isLoggedIn:', isLoggedIn);  // Lägg till logg här
  if (!isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const RedirectIfLoggedIn = ({ children }) => {
  const isLoggedIn = AuthService.isLoggedIn();
  
  console.log('RedirectIfLoggedIn - isLoggedIn:', isLoggedIn);  // Lägg till detta
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">Laddar...</div>;
  }

  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <RedirectIfLoggedIn>
              <Login />
            </RedirectIfLoggedIn>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        
        <Route path="/market" element={<Market />} />
        <Route path="/team" element={<Team />} />
        <Route path="/course/:courseId" element={<CourseToBuyDetail />} /> {/* Dynamisk rutt */}
        <Route path="/course-dashboard" element={<CourseDashboard />} />
        <Route path="/editor" element={<CourseEditor />} />
        <Route path="/editor/:courseId" element={<CourseEditor />} />
        <Route path="/test" element={<TestEditor />} />

<Route 
  path="/company-courses"
  element={
    <ProtectedRoute>
      <CompanyCourses /> 
    </ProtectedRoute>
  }
/>

      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;