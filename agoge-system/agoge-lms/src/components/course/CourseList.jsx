import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourseList = () => {
  const [courses, setCourses] = useState([]); // Sätt initialt som en tom array

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses'); // Exempel på API-url
        setCourses(response.data); // Uppdatera courses med den hämtade datan
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []); // Tom array för att bara köra en gång vid komponentens montering

  // Kontrollera om courses är en array innan du använder .map()
  return (
    <div>
      <h2>Courses</h2>
      <ul>
        {Array.isArray(courses) && courses.length > 0 ? (
          courses.map(course => (
            <li key={course.id}>{course.name}</li>
          ))
        ) : (
          <li>No courses available</li>
        )}
      </ul>
    </div>
  );
};

export default CourseList;
