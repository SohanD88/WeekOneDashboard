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

  function field(
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
    type = 'text',
  ) {
    return (
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium">{label}</Text>
        <TextField.Root
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </Flex>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="480px">
        <Dialog.Title>{contact ? 'Edit Contact' : 'Add Contact'}</Dialog.Title>

        <Flex direction="column" gap="3" mt="4">
          {field('Name', form.name, (v) => setForm({ ...form, name: v }), 'Full name')}
          {field('Email', form.email, (v) => setForm({ ...form, email: v }), 'email@example.com', 'email')}
          {field('Phone Number', form.phoneNumber, (v) => setForm({ ...form, phoneNumber: v }), '(555) 000-0000', 'tel')}
          {field('Address', form.address, (v) => setForm({ ...form, address: v }), '123 Main St')}

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">Role</Text>
            <Select.Root value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <Select.Trigger variant="surface" />
              <Select.Content>
                <Select.Item value="student">Student</Select.Item>
                <Select.Item value="teacher">Teacher</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>

          {field(
            'Class Number',
            String(form.classNumber),
            (v) => setForm({ ...form, classNumber: Number(v) }),
            '1',
            'number',
          )}
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
