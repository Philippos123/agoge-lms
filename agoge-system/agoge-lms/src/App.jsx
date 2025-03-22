import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CourseListPage from './pages/CourseList'; 
import LoginPage from './pages/signup'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CourseListPage />} />
        <Route path="/login" element={<LoginPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;
