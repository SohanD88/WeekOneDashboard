// CRUD operations for the `students` Firestore collection
import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Student } from '../types'

const COL = 'students'

export async function getStudents(): Promise<Student[]> {
  const q = query(collection(db, COL), orderBy('lastName'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Student))
}

export async function getStudent(id: string): Promise<Student | null> {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } as Student : null
}

export async function createStudent(data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) {
  return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}

export async function updateStudent(id: string, data: Partial<Student>) {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteStudent(id: string) {
  return deleteDoc(doc(db, COL, id))
}
