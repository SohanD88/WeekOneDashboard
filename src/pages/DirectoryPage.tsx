import { useEffect, useMemo, useState } from 'react'
import { Box, Callout, Flex, Grid, IconButton, Separator, Spinner, Text, TextField } from '@radix-ui/themes'
import { ExclamationTriangleIcon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'
import ContactCard from '@/components/directory/ContactCard'
import ContactFormDialog from '@/components/directory/ContactFormDialog'
import DirectoryFilter from '@/components/directory/DirectoryFilter'
import { createContact, deleteContact, getContacts, updateContact } from '@/api/contacts'
import type { Contact } from '@/types'

function ContactListHeader() {
  return (
    <>
      <Flex align="center" gap="4" px="4">
        <Grid columns="1.5fr 2fr 1fr 2.5fr 1fr 0.5fr" gap="6" flexGrow="1">
          <Text size="1" weight="bold" color="gray">Name</Text>
          <Text size="1" weight="bold" color="gray">Email</Text>
          <Text size="1" weight="bold" color="gray">Phone Number</Text>
          <Text size="1" weight="bold" color="gray">Address</Text>
          <Text size="1" weight="bold" color="gray">Role</Text>
          <Text size="1" weight="bold" color="gray">Class</Text>
        </Grid>
        <Box width="20px" />
      </Flex>
      <Separator size="4" />
    </>
  )
}

function ContactList({
  contacts,
  onEdit,
  onDelete,
}: {
  contacts: Contact[]
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
}) {
  return (
    <>
      {contacts.map((contact) => (
        <Box key={contact.id}>
          <ContactCard
            contact={contact}
            onEdit={() => onEdit(contact)}
            onDelete={() => onDelete(contact.id)}
          />
        </Box>
      ))}
    </>
  )
}

export default function DirectoryPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilters, setRoleFilters] = useState<string[]>([])
  const [classFilter, setClassFilter] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  useEffect(() => {
    getContacts()
      .then((all) => setContacts(all.filter((c) => c.role === 'student' || c.role === 'teacher')))
      .catch(() => setError('Failed to load contacts. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const availableClasses = useMemo(
    () => [...new Set(contacts.map((contact) => contact.classNumber))].sort((a, b) => a - b),
    [contacts],
  )

  const filteredContacts = useMemo(() => {
    const searchQuery = search.toLowerCase()
    return contacts
      .filter(
        (contact) =>
          searchQuery === '' ||
          contact.name.toLowerCase().includes(searchQuery) ||
          contact.email.toLowerCase().includes(searchQuery),
      )
      .filter((contact) => roleFilters.length === 0 || roleFilters.includes(contact.role))
      .filter((contact) => classFilter === null || contact.classNumber === classFilter)
  }, [contacts, search, roleFilters, classFilter])

  async function handleAdd(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = await createContact(data)
    const newContact: Contact = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setContacts((prev) => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function handleEdit(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!editingContact) return
    await updateContact(editingContact.id, data)
    setContacts((prev) =>
      prev.map((c) =>
        c.id === editingContact.id ? { ...editingContact, ...data, updatedAt: new Date() } : c,
      ),
    )
    setEditingContact(null)
  }

  async function handleDelete(id: string) {
    await deleteContact(id)
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <Box p="6" width="100%">
      <Flex direction="column" gap="4">
        <Text size="6" weight="bold">Directory</Text>

        <Flex gap="3" align="center">
          <Box width="25%">
            <TextField.Root
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon />
              </TextField.Slot>
            </TextField.Root>
          </Box>
          <DirectoryFilter
            roleFilters={roleFilters}
            onRoleChange={setRoleFilters}
            classFilter={classFilter}
            onClassChange={setClassFilter}
            availableClasses={availableClasses}
          />
          <Box ml="auto">
            <IconButton variant="outline" onClick={() => setAddOpen(true)}>
              <PlusIcon />
            </IconButton>
          </Box>
        </Flex>

        <ContactListHeader />

        {error && (
          <Callout.Root color="red">
            <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        {loading && (
          <Flex justify="center" py="8">
            <Spinner size="3" />
          </Flex>
        )}

        {!loading && !error && filteredContacts.length === 0 && (
          <Text color="gray" align="center" mt="8">No contacts found.</Text>
        )}

        {!loading && (
          <ContactList
            contacts={filteredContacts}
            onEdit={setEditingContact}
            onDelete={handleDelete}
          />
        )}
      </Flex>

      <ContactFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
      />

      <ContactFormDialog
        open={editingContact !== null}
        onOpenChange={(open) => { if (!open) setEditingContact(null) }}
        contact={editingContact ?? undefined}
        onSubmit={handleEdit}
      />
    </Box>
  )
}
