import { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { getCourses, getCourseLeaderboard, getGlobalLeaderboard } from '../lib/api';
import { Course, CourseLeaderboardEntry, LeaderboardEntry } from '../lib/types';

const Leaderboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [viewType, setViewType] = useState<'course' | 'global'>('course');
  const [courseLeaderboard, setCourseLeaderboard] = useState<CourseLeaderboardEntry[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (viewType === 'course' && selectedCourse) {
        setLoading(true);
        try {
          const data = await getCourseLeaderboard(selectedCourse);
          setCourseLeaderboard(data);
        } catch (error) {
          console.error('Error fetching course leaderboard:', error);
        } finally {
          setLoading(false);
        }
      } else if (viewType === 'global') {
        setLoading(true);
        try {
          const data = await getGlobalLeaderboard();
          setGlobalLeaderboard(data);
        } catch (error) {
          console.error('Error fetching global leaderboard:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();
  }, [viewType, selectedCourse]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center font-bold';
    switch (rank) {
      case 1:
        return `${baseClasses} bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg`;
      case 2:
        return `${baseClasses} bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg`;
      case 3:
        return `${baseClasses} bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-700`;
    }
  };

  if (loading && courses.length === 0) {
    return (
      <MainLayout title="Leaderboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Leaderboard">
      <div className="space-y-6">
        <p className="text-gray-600">
          See how you rank against other students in your courses.
        </p>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewType('course')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  viewType === 'course'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Course Leaderboard
              </button>
              <button
                onClick={() => setViewType('global')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  viewType === 'global'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Global Leaderboard
              </button>
            </div>

            {viewType === 'course' && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : viewType === 'course' && courseLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No leaderboard data available for this course.</p>
            </div>
          ) : viewType === 'global' && globalLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No global leaderboard data available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Student
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {viewType === 'course'
                    ? courseLeaderboard.map((entry) => (
                        <tr
                          key={entry.userId}
                          className={`transition-colors ${
                            entry.userId === user?.id
                              ? 'bg-blue-50 border-l-4 border-l-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={getRankBadge(entry.rank)}>{entry.rank}</div>
                              {getRankIcon(entry.rank)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {entry.name}
                              </span>
                              {entry.userId === user?.id && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-blue-600">{entry.score} XP</span>
                          </td>
                        </tr>
                      ))
                    : globalLeaderboard.map((entry) => (
                        <tr
                          key={entry.userId}
                          className={`transition-colors ${
                            entry.userId === user?.id
                              ? 'bg-blue-50 border-l-4 border-l-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={getRankBadge(entry.rank)}>{entry.rank}</div>
                              {getRankIcon(entry.rank)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {entry.name}
                              </span>
                              {entry.userId === user?.id && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-blue-600">{entry.score} XP</span>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
