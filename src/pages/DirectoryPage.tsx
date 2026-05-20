import { useEffect, useMemo, useState } from 'react'
import { Box, Callout, Flex, Spinner, Text, TextField } from '@radix-ui/themes'
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import ContactCard from '@/components/directory/ContactCard'
import DirectoryFilter from '@/components/directory/DirectoryFilter'
import { getContacts } from '@/api/contacts'
import type { Contact } from '@/types'

function ContactList({ contacts }: { contacts: Contact[] }) {
  return (
    <>
      {contacts.map((contact) => (
        <Box key={contact.id}>
          <ContactCard contact={contact} />
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
      .filter((contact) =>
        searchQuery === '' ||
        contact.name.toLowerCase().includes(searchQuery) ||
        contact.email.toLowerCase().includes(searchQuery),
      )
      .filter((contact) => roleFilters.length === 0 || roleFilters.includes(contact.role))
      .filter((contact) => classFilter === null || contact.classNumber === classFilter)
  }, [contacts, search, roleFilters, classFilter])

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
        </Flex>

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

        {!loading && <ContactList contacts={filteredContacts} />}
      </Flex>
    </Box>
  )
}
