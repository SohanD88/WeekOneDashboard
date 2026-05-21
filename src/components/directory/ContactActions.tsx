import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton } from '@radix-ui/themes'

interface ContactActionsProps {
  onEdit: () => void
  onDelete: () => void
}

export default function ContactActions({ onEdit, onDelete }: ContactActionsProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" size="1" color="gray">
          <DotsHorizontalIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={onEdit}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item color="red" onClick={onDelete}>Remove</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
