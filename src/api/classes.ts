// CRUD operations for the `classes` Firestore collection

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
import type { SchoolClass } from '@/types'

const col = collection(db, 'classes')

export async function getClasses(): Promise<SchoolClass[]> {
  const snap = await getDocs(col)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SchoolClass)
}

export async function getClass(id: string): Promise<SchoolClass | null> {
  const snap = await getDoc(doc(db, 'classes', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as SchoolClass
}

export async function createClass(
  data: Omit<SchoolClass, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(col, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateClass(
  id: string,
  data: Partial<Omit<SchoolClass, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'classes', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteClass(id: string): Promise<void> {
  await deleteDoc(doc(db, 'classes', id))
}
