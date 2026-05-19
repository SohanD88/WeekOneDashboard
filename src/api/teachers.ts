// CRUD operations for the `teachers` Firestore collection
import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Teacher } from '../types'

const COL = 'teachers'

export async function getTeachers(): Promise<Teacher[]> {
  const q = query(collection(db, COL), orderBy('lastName'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher))
}

export async function getTeacher(id: string): Promise<Teacher | null> {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } as Teacher : null
}

export async function createTeacher(data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) {
  return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}

export async function updateTeacher(id: string, data: Partial<Teacher>) {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteTeacher(id: string) {
  return deleteDoc(doc(db, COL, id))
}
