import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:8000/api/coursetobuy";

export default function CourseDetail() {
  const { courseId } = useParams(); // Hämta kurs-ID från URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/${courseId}/`)
      .then((response) => response.json())
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching course:", error));
  }, [courseId]);

  if (loading) return <p>Laddar...</p>;
  if (!course) return <p>Kurs hittades inte.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <img 
        src={`http://localhost:8000${course.image_url}`} 
        alt={course.title} 
        className="w-full h-64 object-cover rounded-lg mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <p className="text-lg font-semibold">Pris: {course.price} SEK</p>
      <p className="text-gray-500">Språk: {course.language_icon}</p>
      <button className="mt-4 px-6 py-2 bg-green-500  rounded-md hover:bg-green-600 transition">
        Köp nu
      </button>
    </div>
  );
}
