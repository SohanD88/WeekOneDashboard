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

export async function getContacts(): Promise<Contact[]> {
  const nameQuery = query(col, orderBy('name'))
  const snap = await getDocs(nameQuery)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Contact)
}

export async function getContact(id: string): Promise<Contact | null> {
  const snap = await getDoc(doc(db, 'contacts', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Contact
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
