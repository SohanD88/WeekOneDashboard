// CRUD operations for the `grades` Firestore collection

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Grade } from '../types'

const col = collection(db, 'grades')

export async function getGrades(): Promise<Grade[]> {
  const snap = await getDocs(col)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Grade)
}

export async function getGrade(id: string): Promise<Grade | null> {
  const snap = await getDoc(doc(db, 'grades', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Grade
}

export async function createGrade(
  data: Omit<Grade, 'id' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(col, {
    ...data,
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getGradesByClass(classId: string): Promise<Grade[]> {
  const q = query(col, where('classId', '==', classId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Grade)
}

export async function getGradesByStudent(studentId: string): Promise<Grade[]> {
  const q = query(col, where('studentId', '==', studentId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Grade)
}

export async function updateGrade(
  id: string,
  data: Partial<Omit<Grade, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'grades', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteGrade(id: string): Promise<void> {
  await deleteDoc(doc(db, 'grades', id))
}
