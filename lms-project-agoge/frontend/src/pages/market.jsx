import CourseList from '../components/CourseToBuy';
import Navbar from '../components/navbar';
import { useEffect, useState } from 'react';
import { CourseService } from '../services/api';

export default function Market() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await CourseService.getCourses();
            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Kunde inte hämta kurser. Försök igen senare.');
        } finally {
            setLoading(false);
        }
        };
    
        fetchCourses();
    }, []);
    
    return (
        <>
        <Navbar />
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold my-4">Marketplace</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <CourseList courses={courses} />
        </div>
        </>
    );
}

