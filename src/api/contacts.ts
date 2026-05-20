import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Contact } from '@/types'

const col = collection(db, 'contacts')

function normalizeContact(id: string, data: Record<string, unknown>): Contact {
  return {
    ...data,
    id,
    role: String(data.role ?? '').toLowerCase() as Contact['role'],
  } as Contact
}

export async function getContacts(): Promise<Contact[]> {
  const nameQuery = query(col, orderBy('name'))
  const snap = await getDocs(nameQuery)
  return snap.docs.map((document) => normalizeContact(document.id, document.data()))
}

export async function getContact(id: string): Promise<Contact | null> {
  const snap = await getDoc(doc(db, 'contacts', id))
  if (!snap.exists()) return null
  return normalizeContact(snap.id, snap.data())
}

export async function createContact(
  data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(col, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateContact(
  id: string,
  data: Partial<Omit<Contact, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'contacts', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteContact(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contacts', id))
}
