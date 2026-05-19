// CRUD operations for the `events` Firestore collection

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
import type { SchoolEvent } from '../types'

const col = collection(db, 'events')

export async function getEvents(): Promise<SchoolEvent[]> {
  const snap = await getDocs(col)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SchoolEvent)
}

export async function getEvent(id: string): Promise<SchoolEvent | null> {
  const snap = await getDoc(doc(db, 'events', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as SchoolEvent
}

export async function createEvent(
  data: Omit<SchoolEvent, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(col, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<SchoolEvent, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'events', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id))
}
