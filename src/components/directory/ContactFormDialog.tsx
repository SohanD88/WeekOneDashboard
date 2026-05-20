import { useEffect, useState } from 'react'
import { Button, Dialog, Flex, Select, Text, TextField } from '@radix-ui/themes'
import type { Contact } from '@/types'

interface ContactFormData {
  name: string
  email: string
  phoneNumber: string
  address: string
  role: string
  classNumber: number
}

interface ContactFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact
  onSubmit: (data: ContactFormData) => Promise<void>
}

const empty: ContactFormData = {
  name: '',
  email: '',
  phoneNumber: '',
  address: '',
  role: 'student',
  classNumber: 1,
}

export default function ContactFormDialog({
  open,
  onOpenChange,
  contact,
  onSubmit,
}: ContactFormDialogProps) {
  const [form, setForm] = useState<ContactFormData>(empty)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm(
      contact
        ? {
            name: contact.name,
            email: contact.email,
            phoneNumber: contact.phoneNumber,
            address: contact.address,
            role: contact.role,
            classNumber: contact.classNumber,
          }
        : empty,
    )
  }, [contact, open])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await onSubmit(form)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="480px">
        <Dialog.Title>{contact ? 'Edit Contact' : 'Add Contact'}</Dialog.Title>

        <Flex direction="column" gap="3" mt="4">
          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">Name</Text>
            <TextField.Root
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Full name"
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">Email</Text>
            <TextField.Root
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="email@example.com"
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">Phone Number</Text>
            <TextField.Root
              type="tel"
              value={form.phoneNumber}
              onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
              placeholder="(555) 000-0000"
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">Address</Text>
            <TextField.Root
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              placeholder="123 Main St"
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">Role</Text>
            <Select.Root value={form.role} onValueChange={(selectedRole) => setForm({ ...form, role: selectedRole })}>
              <Select.Trigger variant="surface" />
              <Select.Content>
                <Select.Item value="student">Student</Select.Item>
                <Select.Item value="teacher">Teacher</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">Class Number</Text>
            <TextField.Root
              type="number"
              value={String(form.classNumber)}
              onChange={(event) => setForm({ ...form, classNumber: Number(event.target.value) })}
              placeholder="1"
            />
          </Flex>
        </Flex>

        <Flex gap="3" mt="5" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">Cancel</Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} loading={submitting}>
            {contact ? 'Save' : 'Add'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
