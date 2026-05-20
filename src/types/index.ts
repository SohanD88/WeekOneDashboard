export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  gradeLevel: number
  enrolledClassIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  classIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface SchoolClass {
  id: string
  name: string
  subject: string
  teacherId: string
  studentIds: string[]
  period: string
  schoolYear: string
  averageGrade: number | null
  averageLetterGrade: string | null
  createdAt: Date
  updatedAt: Date
}

export type GradeCategory = 'quizzes' | 'tests' | 'participation' | 'projects'

export const CATEGORY_WEIGHTS: Record<GradeCategory, number> = {
  quizzes: 0.20,
  tests: 0.30,
  participation: 0.25,
  projects: 0.25,
}

export interface Grade {
  id: string
  studentId: string
  classId: string
  assignmentName: string
  category: GradeCategory
  score: number // 0–100
  updatedAt: Date
}

export interface SchoolEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  eventType: 'holiday' | 'exam' | 'activity' | 'meeting' | 'other'
  createdAt: Date
  updatedAt: Date
}

export interface Contact {
  id: string
  name: string
  email: string
  phoneNumber: string
  address: string
  role: string
  classNumber: number
  createdAt: Date
  updatedAt: Date
}
