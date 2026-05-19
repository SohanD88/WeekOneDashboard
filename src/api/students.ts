// CRUD operations for the `students` Firestore collection

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Student } from '@/types'

const col = collection(db, 'students')

export async function getStudents(): Promise<Student[]> {
  const snap = await getDocs(col)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Student)
}

export async function getStudent(id: string): Promise<Student | null> {
  const snap = await getDoc(doc(db, 'students', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Student
}

export async function createStudent(
  data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(col, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateStudent(
  id: string,
  data: Partial<Omit<Student, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'students', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteStudent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'students', id))
}
