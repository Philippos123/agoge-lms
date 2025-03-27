import React from "react";
import Navbar from "../components/navbar"; // Justera sökvägen för Navbar-importen
import CourseList from "../components/lms/CourseDashboard"; // Korrekt import

export default function CourseDashboard() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold my-6">Mina kurser</h1>
        <CourseList />
      </div>
    </>
  );
}
