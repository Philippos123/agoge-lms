import { Link } from "react-router-dom";

export default function CourseToBuy({ courses }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 cursor-pointer ">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white shadow-md rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-300 "
          >
            {/* Bilden högst upp */}
            <img
            src={`http://localhost:8000/${course.image_url}`}
            alt={course.title}
              className="w-full h-48 object-cover group-hover:opacity-100"
            />
  
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Pris: {course.price} SEK</span>
                <span className="text-sm text-gray-500">{course.language_icon}</span>
              </div>
              <div className="flex justify-center mb-4">
              <Link
                to={`/course/${course.id}`} // Dynamisk länk
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
              >
                Köp kurs
              </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  