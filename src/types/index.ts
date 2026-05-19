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
  createdAt: Date
  updatedAt: Date
}

export interface Grade {
  id: string
  studentId: string
  classId: string
  score: number       // 0–100
  letterGrade: string // A, B, C, D, F
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
