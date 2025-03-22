import React from "react";
import CourseList from "../components/course/CourseList";
import Navbar from "../components/navbar";

const CourseListPage = () => {
    return (
        <div>
        <Navbar />
        <h2>Courses</h2>
        <CourseList />
        </div>
    );
    };

export default CourseListPage;