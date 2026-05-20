// CRUD operations for the `teachers` Firestore collection

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
import { db } from '../lib/firebase'
import type { Teacher } from '../types'

const col = collection(db, 'teachers')

export async function getTeachers(): Promise<Teacher[]> {
  const snap = await getDocs(col)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Teacher)
}

export async function getTeacher(id: string): Promise<Teacher | null> {
  const snap = await getDoc(doc(db, 'teachers', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Teacher
}

export async function createTeacher(
  data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(col, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTeacher(
  id: string,
  data: Partial<Omit<Teacher, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'teachers', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTeacher(id: string): Promise<void> {
  await deleteDoc(doc(db, 'teachers', id))
}
