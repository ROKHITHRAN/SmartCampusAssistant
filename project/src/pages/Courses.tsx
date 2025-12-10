import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { getCourses } from '../lib/api';
import { Course } from '../lib/types';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <MainLayout title="Courses">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Courses">
      <div className="space-y-6">
        <p className="text-gray-600">
          Browse your courses and manage your learning materials.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer group"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                View Materials
                <ArrowRight className="w-5 h-5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Courses;
