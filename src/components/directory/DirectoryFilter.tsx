import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  CheckboxGroup,
  Flex,
  Popover,
  Select,
  Separator,
  Text,
} from '@radix-ui/themes'

interface DirectoryFilterProps {
  roleFilters: string[]
  onRoleChange: (roles: string[]) => void
  classFilter: number | null
  onClassChange: (classNum: number | null) => void
  availableClasses: number[]
}

export default function DirectoryFilter({
  roleFilters,
  onRoleChange,
  classFilter,
  onClassChange,
  availableClasses,
}: DirectoryFilterProps) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="outline">
          <MixerHorizontalIcon />
          Filter
        </Button>
      </Popover.Trigger>

      <Popover.Content width="200px">
        <Flex direction="column" gap="3">
          <Box>
            <Text size="1" weight="bold" color="gray" mb="2">Role</Text>
            <CheckboxGroup.Root
              value={roleFilters}
              onValueChange={onRoleChange}
            >
              <CheckboxGroup.Item value="student">Student</CheckboxGroup.Item>
              <CheckboxGroup.Item value="teacher">Teacher</CheckboxGroup.Item>
            </CheckboxGroup.Root>
          </Box>

          <Separator size="4" />

          <Box>
            <Text size="1" weight="bold" color="gray">Class</Text>
            <Box mt="2">
              <Select.Root
                value={classFilter !== null ? String(classFilter) : 'all'}
                onValueChange={(value) => onClassChange(value === 'all' ? null : Number(value))}
              >
                <Select.Trigger variant="surface" placeholder="All Classes" />
                <Select.Content>
                  <Select.Item value="all">All Classes</Select.Item>
                  {availableClasses.map((classNum) => (
                    <Select.Item key={classNum} value={String(classNum)}>
                      Class {classNum}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Box>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
