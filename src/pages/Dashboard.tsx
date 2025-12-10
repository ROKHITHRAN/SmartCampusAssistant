import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Brain, TrendingUp, Trophy, Clock } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  getDashboardStats,
  getCourses,
  getCourseLeaderboard,
  getRecentActivity,
} from '../lib/api';
import { DashboardStats, Course, CourseLeaderboardEntry, RecentActivity } from '../lib/types';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<CourseLeaderboardEntry[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, coursesData, activityData] = await Promise.all([
          getDashboardStats(),
          getCourses(),
          getRecentActivity(),
        ]);
        setStats(statsData);
        setCourses(coursesData);
        setRecentActivity(activityData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (selectedCourse) {
        try {
          const data = await getCourseLeaderboard(selectedCourse);
          setLeaderboard(data);
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
        }
      }
    };

    fetchLeaderboard();
  }, [selectedCourse]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h3>
          <p className="text-gray-600">Here's a quick overview of your learning progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats?.totalNotes || 0}
              </span>
            </div>
            <h4 className="text-gray-600 font-medium">Total Notes</h4>
            <p className="text-xs text-gray-500 mt-1">Uploaded materials</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats?.totalQuestions || 0}
              </span>
            </div>
            <h4 className="text-gray-600 font-medium">Questions Asked</h4>
            <p className="text-xs text-gray-500 mt-1">In Q&A sessions</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {stats?.totalQuizzes || 0}
              </span>
            </div>
            <h4 className="text-gray-600 font-medium">Quizzes Taken</h4>
            <p className="text-xs text-gray-500 mt-1">Practice sessions</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {stats?.averageScore || 0}%
              </span>
            </div>
            <h4 className="text-gray-600 font-medium">Average Score</h4>
            <p className="text-xs text-gray-500 mt-1">Quiz performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900">Course Leaderboard</h3>
              </div>
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
            </div>

            {leaderboard.length > 0 ? (
              <>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.userId === user?.id
                          ? 'bg-blue-50 border-2 border-blue-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            entry.rank === 1
                              ? 'bg-yellow-400 text-yellow-900'
                              : entry.rank === 2
                              ? 'bg-gray-300 text-gray-700'
                              : entry.rank === 3
                              ? 'bg-orange-400 text-orange-900'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {entry.rank}
                        </div>
                        <span className="font-medium text-gray-900">{entry.name}</span>
                      </div>
                      <span className="font-bold text-blue-600">{entry.score} XP</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="w-full mt-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Full Leaderboard
                </button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No leaderboard data available
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
