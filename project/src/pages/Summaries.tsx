import { useState, useEffect } from 'react';
import { FileText, Calendar, X } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { getSummaries, getCourses } from '../lib/api';
import { Summary, Course } from '../lib/types';

const Summaries = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summariesData, coursesData] = await Promise.all([
          getSummaries(),
          getCourses(),
        ]);
        setSummaries(summariesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.name || 'Unknown Course';
  };

  const groupedSummaries = summaries.reduce((acc, summary) => {
    const courseName = getCourseName(summary.courseId);
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(summary);
    return acc;
  }, {} as Record<string, Summary[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <MainLayout title="Summaries">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Summaries">
      <div className="space-y-6">
        <p className="text-gray-600">
          View all your generated summaries organized by course.
        </p>

        {Object.keys(groupedSummaries).length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No summaries yet</h3>
            <p className="text-gray-600">
              Generate summaries from your course materials to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSummaries).map(([courseName, courseSummaries]) => (
              <div key={courseName} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{courseName}</h3>
                <div className="space-y-4">
                  {courseSummaries.map((summary) => (
                    <div
                      key={summary.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="w-5 h-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {summary.materialTitle || 'Untitled Material'}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {formatDate(summary.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {summary.content}
                      </p>
                      <button
                        onClick={() => setSelectedSummary(summary)}
                        className="text-blue-600 font-medium text-sm hover:text-blue-700"
                      >
                        View full summary
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedSummary.materialTitle || 'Untitled Material'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getCourseName(selectedSummary.courseId)} •{' '}
                  {formatDate(selectedSummary.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSummary(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedSummary.content}
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedSummary(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Summaries;
