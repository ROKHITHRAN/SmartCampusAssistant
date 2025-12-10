import {
  User,
  DashboardStats,
  Course,
  Material,
  Summary,
  QuizQuestion,
  CourseLeaderboardEntry,
  LeaderboardEntry,
  AskQuestionPayload,
  AskQuestionResponse,
  RecentActivity,
} from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockCourses: Course[] = [
  {
    id: 'ds-101',
    name: 'Data Structures',
    description: 'Learn about arrays, linked lists, trees, graphs, and advanced data structures.',
  },
  {
    id: 'os-201',
    name: 'Operating Systems',
    description: 'Understand process management, memory allocation, and system calls.',
  },
  {
    id: 'math-301',
    name: 'Mathematics',
    description: 'Discrete math, calculus, and linear algebra for computer science.',
  },
  {
    id: 'net-401',
    name: 'Computer Networks',
    description: 'Learn about protocols, TCP/IP, routing, and network security.',
  },
];

const mockMaterials: Record<string, Material[]> = {
  'ds-101': [
    {
      id: 'mat-1',
      courseId: 'ds-101',
      title: 'Introduction to Arrays and Linked Lists.pdf',
      type: 'pdf',
      uploadedAt: '2025-01-15T10:30:00Z',
    },
    {
      id: 'mat-2',
      courseId: 'ds-101',
      title: 'Tree Structures and Traversals.ppt',
      type: 'ppt',
      uploadedAt: '2025-01-20T14:20:00Z',
    },
  ],
  'os-201': [
    {
      id: 'mat-3',
      courseId: 'os-201',
      title: 'Process Management.pdf',
      type: 'pdf',
      uploadedAt: '2025-01-18T09:15:00Z',
    },
  ],
  'math-301': [
    {
      id: 'mat-4',
      courseId: 'math-301',
      title: 'Linear Algebra Basics.doc',
      type: 'doc',
      uploadedAt: '2025-01-22T11:00:00Z',
    },
  ],
  'net-401': [],
};

const mockSummaries: Summary[] = [
  {
    id: 'sum-1',
    materialId: 'mat-1',
    courseId: 'ds-101',
    materialTitle: 'Introduction to Arrays and Linked Lists.pdf',
    content: 'Arrays are contiguous memory structures that allow O(1) access time. Linked lists provide dynamic memory allocation with O(n) traversal time. Arrays excel at random access, while linked lists are better for frequent insertions and deletions.',
    createdAt: '2025-01-15T11:00:00Z',
  },
  {
    id: 'sum-2',
    materialId: 'mat-3',
    courseId: 'os-201',
    materialTitle: 'Process Management.pdf',
    content: 'Process management involves creating, scheduling, and terminating processes. The OS maintains a process control block (PCB) for each process. Key concepts include context switching, process states (new, ready, running, waiting, terminated), and scheduling algorithms like FCFS, SJF, and Round Robin.',
    createdAt: '2025-01-18T10:00:00Z',
  },
];

const mockLeaderboards: Record<string, CourseLeaderboardEntry[]> = {
  'ds-101': [
    { courseId: 'ds-101', userId: 'user-2', name: 'Alice Johnson', rank: 1, score: 950 },
    { courseId: 'ds-101', userId: 'user-1', name: 'John Doe', rank: 2, score: 820 },
    { courseId: 'ds-101', userId: 'user-3', name: 'Bob Smith', rank: 3, score: 780 },
    { courseId: 'ds-101', userId: 'user-4', name: 'Carol Williams', rank: 4, score: 710 },
  ],
  'os-201': [
    { courseId: 'os-201', userId: 'user-1', name: 'John Doe', rank: 1, score: 890 },
    { courseId: 'os-201', userId: 'user-3', name: 'Bob Smith', rank: 2, score: 850 },
    { courseId: 'os-201', userId: 'user-2', name: 'Alice Johnson', rank: 3, score: 800 },
  ],
  'math-301': [
    { courseId: 'math-301', userId: 'user-4', name: 'Carol Williams', rank: 1, score: 920 },
    { courseId: 'math-301', userId: 'user-1', name: 'John Doe', rank: 2, score: 860 },
    { courseId: 'math-301', userId: 'user-2', name: 'Alice Johnson', rank: 3, score: 830 },
  ],
  'net-401': [
    { courseId: 'net-401', userId: 'user-1', name: 'John Doe', rank: 1, score: 750 },
    { courseId: 'net-401', userId: 'user-4', name: 'Carol Williams', rank: 2, score: 720 },
  ],
};

let currentUser: User | null = null;

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800);

  if (password.length < 3) {
    throw new Error('Invalid credentials');
  }

  currentUser = {
    id: 'user-1',
    name: 'John Doe',
    email,
    rank: 2,
    globalScore: 3320,
  };

  return currentUser;
};

export const register = async (data: { name: string; email: string; password: string }): Promise<User> => {
  await delay(800);

  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  currentUser = {
    id: 'user-new',
    name: data.name,
    email: data.email,
    rank: 0,
    globalScore: 0,
  };

  return currentUser;
};

export const logout = async (): Promise<void> => {
  await delay(300);
  currentUser = null;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  await delay(500);
  return {
    totalNotes: 12,
    totalQuestions: 48,
    totalQuizzes: 8,
    averageScore: 78,
  };
};

export const getRecentActivity = async (): Promise<RecentActivity[]> => {
  await delay(400);
  return [
    { id: '1', text: 'You uploaded notes to Data Structures', timestamp: '2025-01-20T14:30:00Z' },
    { id: '2', text: 'You scored 4/5 in OS Quiz', timestamp: '2025-01-19T11:20:00Z' },
    { id: '3', text: 'You asked 3 questions about Trees', timestamp: '2025-01-18T16:45:00Z' },
    { id: '4', text: 'You generated a summary for Process Management', timestamp: '2025-01-18T10:15:00Z' },
    { id: '5', text: 'You uploaded notes to Mathematics', timestamp: '2025-01-17T09:00:00Z' },
  ];
};

export const getCourses = async (): Promise<Course[]> => {
  await delay(500);
  return mockCourses;
};

export const getCourseMaterials = async (courseId: string): Promise<Material[]> => {
  await delay(400);
  return mockMaterials[courseId] || [];
};

export const uploadMaterial = async (courseId: string, file: File): Promise<Material> => {
  await delay(1500);

  const fileType = file.name.endsWith('.pdf') ? 'pdf'
    : file.name.endsWith('.ppt') || file.name.endsWith('.pptx') ? 'ppt'
    : file.name.endsWith('.doc') || file.name.endsWith('.docx') ? 'doc'
    : 'other';

  const newMaterial: Material = {
    id: `mat-${Date.now()}`,
    courseId,
    title: file.name,
    type: fileType,
    uploadedAt: new Date().toISOString(),
  };

  if (!mockMaterials[courseId]) {
    mockMaterials[courseId] = [];
  }
  mockMaterials[courseId].push(newMaterial);

  return newMaterial;
};

export const summarizeMaterial = async (materialId: string): Promise<Summary> => {
  await delay(1200);

  const material = Object.values(mockMaterials)
    .flat()
    .find(m => m.id === materialId);

  const summary: Summary = {
    id: `sum-${Date.now()}`,
    materialId,
    courseId: material?.courseId || '',
    materialTitle: material?.title,
    content: `This is a comprehensive summary of ${material?.title}. The document covers key concepts, important definitions, and practical examples. It provides a thorough overview of the subject matter with clear explanations and real-world applications. Students will find this summary helpful for quick revision and understanding core principles.`,
    createdAt: new Date().toISOString(),
  };

  mockSummaries.push(summary);
  return summary;
};

export const getSummaries = async (): Promise<Summary[]> => {
  await delay(500);
  return mockSummaries;
};

export const askQuestion = async (payload: AskQuestionPayload): Promise<AskQuestionResponse> => {
  await delay(1500);

  const answers = [
    'Based on your uploaded materials, the key concept is that data structures provide efficient ways to organize and access data. Arrays offer O(1) access time but fixed size, while linked lists provide dynamic sizing with O(n) traversal.',
    'According to the course materials, process management in operating systems involves scheduling, memory allocation, and inter-process communication. The OS uses context switching to multiplex CPU time among processes.',
    'The materials explain that this topic involves understanding the fundamental principles and applying them to solve real-world problems. Key takeaways include proper algorithm selection and time complexity analysis.',
    'From your notes, we can see that the main approach involves breaking down complex problems into smaller, manageable components. This allows for better understanding and more efficient solutions.',
  ];

  const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

  return {
    answer: randomAnswer,
    sources: ['Introduction to Arrays and Linked Lists.pdf', 'Process Management.pdf'],
  };
};

export const generateQuiz = async (materialId: string): Promise<QuizQuestion[]> => {
  await delay(1500);

  return [
    {
      id: 'q1',
      question: 'What is the time complexity of accessing an element in an array by index?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctIndex: 0,
    },
    {
      id: 'q2',
      question: 'Which data structure uses LIFO (Last In First Out) ordering?',
      options: ['Queue', 'Stack', 'Array', 'Hash Table'],
      correctIndex: 1,
    },
    {
      id: 'q3',
      question: 'What is the main advantage of a linked list over an array?',
      options: ['Faster access time', 'Dynamic size', 'Less memory usage', 'Simpler implementation'],
      correctIndex: 1,
    },
    {
      id: 'q4',
      question: 'In a binary search tree, what is the maximum number of children a node can have?',
      options: ['1', '2', '3', 'Unlimited'],
      correctIndex: 1,
    },
    {
      id: 'q5',
      question: 'What is the purpose of a hash function in a hash table?',
      options: ['Sort elements', 'Map keys to indices', 'Encrypt data', 'Compress data'],
      correctIndex: 1,
    },
  ];
};

export const submitQuiz = async (answers: {
  materialId: string;
  responses: { questionId: string; selectedIndex: number }[];
}): Promise<{ score: number; total: number }> => {
  await delay(800);

  const correctAnswers = [0, 1, 1, 1, 1];
  let score = 0;

  answers.responses.forEach((response, index) => {
    if (response.selectedIndex === correctAnswers[index]) {
      score++;
    }
  });

  return {
    score,
    total: answers.responses.length,
  };
};

export const getCourseLeaderboard = async (courseId: string): Promise<CourseLeaderboardEntry[]> => {
  await delay(600);
  return mockLeaderboards[courseId] || [];
};

export const getGlobalLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  await delay(600);
  return [
    { userId: 'user-2', name: 'Alice Johnson', rank: 1, score: 2580 },
    { userId: 'user-1', name: 'John Doe', rank: 2, score: 3320 },
    { userId: 'user-4', name: 'Carol Williams', rank: 3, score: 2350 },
    { userId: 'user-3', name: 'Bob Smith', rank: 4, score: 1630 },
  ];
};
