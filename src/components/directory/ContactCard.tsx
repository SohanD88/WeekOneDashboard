import { Box, Flex, Grid, Text } from '@radix-ui/themes'
import ContactActions from '@/components/directory/ContactActions'
import type { Contact } from '@/types'

interface ContactCardProps {
  contact: Contact
  onEdit: () => void
  onDelete: () => void
}

export default function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  return (
    <Box
      p="4"
      className={contact.role === 'teacher' ? 'contact-teacher' : 'contact-student'}
    >
      <Flex align="center" gap="4">
        <Grid columns="1.5fr 2fr 1fr 2.5fr 1fr 0.5fr" gap="6" align="center" flexGrow="1">
          <Text size="2" truncate>{contact.name}</Text>
          <Text size="2" truncate>{contact.email}</Text>
          <Text size="2" truncate>{contact.phoneNumber}</Text>
          <Text size="2" truncate>{contact.address}</Text>
          <Text size="2" weight="medium">{contact.role === 'teacher' ? 'Teacher' : 'Student'}</Text>
          <Text size="2" weight="medium">{contact.classNumber}</Text>
        </Grid>

        <ContactActions onEdit={onEdit} onDelete={onDelete} />
      </Flex>
    </Box>
  )
}
