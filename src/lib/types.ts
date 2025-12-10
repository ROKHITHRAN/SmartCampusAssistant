export interface User {
  id: string;
  name: string;
  email: string;
  rank?: number;
  globalScore?: number;
  stats?: DashboardStats;
}

export interface DashboardStats {
  totalNotes: number;
  totalQuestions: number;
  totalQuizzes: number;
  averageScore: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
}

export interface Material {
  id: string;
  courseId: string;
  title: string;
  type: "pdf" | "doc" | "ppt" | "other";
  uploadedAt: string;
}

export interface Summary {
  id: string;
  materialId: string;
  courseId: string;
  content: string;
  createdAt: string;
  materialTitle?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  rank: number;
  score: number;
}

export interface CourseLeaderboardEntry {
  courseId: string;
  userId: string;
  name: string;
  rank: number;
  score: number;
}

export interface AskQuestionPayload {
  question: string;
  courseId?: string;
  materialIds?: string[];
}

export interface AskQuestionResponse {
  answer: string;
  sources?: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface RecentActivity {
  id: string;
  text: string;
  timestamp: string;
}
