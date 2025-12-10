import { useState, useEffect, DragEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  File,
  Presentation,
  Calendar,
  Sparkles,
  MessageSquare,
  Brain,
  Loader2,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { getCourses, getCourseMaterials, uploadMaterial, summarizeMaterial } from '../lib/api';
import { Course, Material } from '../lib/types';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [summarizing, setSummarizing] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      try {
        const [coursesData, materialsData] = await Promise.all([
          getCourses(),
          getCourseMaterials(courseId),
        ]);
        const foundCourse = coursesData.find((c) => c.id === courseId);
        setCourse(foundCourse || null);
        setMaterials(materialsData);
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!courseId) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const file = files[0];
      const newMaterial = await uploadMaterial(courseId, file);
      setMaterials((prev) => [...prev, newMaterial]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSummarize = async (materialId: string) => {
    setSummarizing(materialId);
    try {
      const summary = await summarizeMaterial(materialId);
      alert(`Summary:\n\n${summary.content}`);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setSummarizing(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'ppt':
        return <Presentation className="w-6 h-6 text-orange-500" />;
      case 'doc':
        return <File className="w-6 h-6 text-blue-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

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
      <MainLayout title="Course Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout title="Course Not Found">
        <div className="text-center py-12">
          <p className="text-gray-600">Course not found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={course.name}>
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h2>
          <p className="text-gray-600">{course.description}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Materials</h3>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              disabled={uploading}
            />

            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {uploading ? 'Uploading...' : 'Upload your course materials'}
              </h4>
              <p className="text-gray-600 mb-2">
                Drag & drop your PDFs, PPTs, or DOCs here, or click to browse
              </p>
              <p className="text-sm text-gray-500">Supports: PDF, DOC, DOCX, PPT, PPTX</p>
            </label>

            {uploading && (
              <div className="mt-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              </div>
            )}

            {uploadSuccess && (
              <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg inline-block">
                File uploaded successfully!
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Course Materials</h3>

          {materials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No materials uploaded yet. Upload your first material above!
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getFileIcon(material.type)}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {material.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(material.uploadedAt)}
                          </span>
                          <span className="uppercase text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                            {material.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSummarize(material.id)}
                        disabled={summarizing === material.id}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        {summarizing === material.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Summarizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Summarize
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/qa?course=${courseId}&material=${material.id}`)}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Ask Questions
                      </button>
                      <button
                        onClick={() => navigate(`/quiz?material=${material.id}`)}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm flex items-center gap-2"
                      >
                        <Brain className="w-4 h-4" />
                        Generate Quiz
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetail;
