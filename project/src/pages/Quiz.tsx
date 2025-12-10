import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, CheckCircle2, XCircle, Loader2, Trophy } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { getCourses, getCourseMaterials, generateQuiz, submitQuiz } from '../lib/api';
import { Course, Material, QuizQuestion } from '../lib/types';

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (selectedCourse) {
        try {
          const data = await getCourseMaterials(selectedCourse);
          setMaterials(data);
        } catch (error) {
          console.error('Error fetching materials:', error);
        }
      } else {
        setMaterials([]);
      }
    };

    fetchMaterials();
  }, [selectedCourse]);

  useEffect(() => {
    const materialParam = searchParams.get('material');
    if (materialParam) {
      setSelectedMaterial(materialParam);
    }
  }, [searchParams]);

  const handleGenerateQuiz = async () => {
    if (!selectedMaterial) {
      alert('Please select a material first');
      return;
    }

    setLoading(true);
    setSubmitted(false);
    setScore(null);
    setAnswers({});

    try {
      const quizQuestions = await generateQuiz(selectedMaterial);
      setQuestions(quizQuestions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    setLoading(true);
    try {
      const responses = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id],
      }));

      const result = await submitQuiz({
        materialId: selectedMaterial,
        responses,
      });

      setScore(result);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isCorrect = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    return question?.correctIndex === optionIndex;
  };

  return (
    <MainLayout title="Quiz">
      <div className="space-y-6">
        <p className="text-gray-600">
          Generate quizzes from your course materials to test your understanding.
        </p>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quiz Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={questions.length > 0}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedCourse || questions.length > 0}
              >
                <option value="">Select a material</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateQuiz}
                disabled={!selectedMaterial || loading || questions.length > 0}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && questions.length === 0 ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {questions.length > 0 && (
          <>
            {submitted && score && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h3>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {score.score} / {score.total}
                </p>
                <p className="text-gray-600 mb-6">
                  You scored {Math.round((score.score / score.total) * 100)}%
                </p>
                <button
                  onClick={() => {
                    setQuestions([]);
                    setAnswers({});
                    setSubmitted(false);
                    setScore(null);
                    setSelectedMaterial('');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Take Another Quiz
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Questions</h3>
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {index + 1}. {question.question}
                    </h4>
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = answers[question.id] === optionIndex;
                        const showCorrect = submitted && isCorrect(question.id, optionIndex);
                        const showIncorrect =
                          submitted && isSelected && !isCorrect(question.id, optionIndex);

                        return (
                          <button
                            key={optionIndex}
                            onClick={() => handleAnswerSelect(question.id, optionIndex)}
                            disabled={submitted}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                              showCorrect
                                ? 'border-green-500 bg-green-50'
                                : showIncorrect
                                ? 'border-red-500 bg-red-50'
                                : isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {showCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                              {showIncorrect && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!submitted && (
                <button
                  onClick={handleSubmit}
                  disabled={loading || Object.keys(answers).length !== questions.length}
                  className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </button>
              )}
            </div>
          </>
        )}

        {questions.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to test your knowledge?</h3>
            <p className="text-gray-600">
              Select a course and material above, then click Generate Quiz to begin.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Quiz;
