// Class detail page — roster, average grade, teacher grade management
import { Link } from 'react-router-dom'
import { Box, Flex, Grid, Heading, Text, Card, Button, TextField, Select } from '@radix-ui/themes'

const placeholderStudents = ['Student A', 'Student B', 'Student C', 'Student D', 'Student E']

function Placeholder({ label, minHeight = 120 }: { label: string; minHeight?: number }) {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        flex: 1,
        minHeight,
        border: '1px dashed var(--gray-a6)',
        borderRadius: 'var(--radius-3)',
        background: 'var(--gray-a2)',
      }}
    >
      <Text size="2" color="gray">{label}</Text>
    </Flex>
  )
}

export default function ClassPage() {
  return (
    <Flex direction="column" gap="4" style={{ flex: 1, minHeight: 0 }}>
      <Flex align="center" gap="3">
        <Button asChild variant="soft" size="2">
          <Link to="/dashboard">← Back to directory</Link>
        </Button>
        <Heading size="5">Class Name</Heading>
      </Flex>

      <Grid columns={{ initial: '1', md: '3' }} gap="4" style={{ flex: 1, minHeight: 0 }}>
        <Card>
          <Heading size="3" mb="3">Students</Heading>
          <Flex direction="column" gap="2">
            {placeholderStudents.map((s) => (
              <Box
                key={s}
                p="2"
                style={{
                  borderRadius: 'var(--radius-2)',
                  background: 'var(--gray-a3)',
                  cursor: 'pointer',
                }}
              >
                <Text size="2">{s}</Text>
              </Box>
            ))}
          </Flex>
        </Card>

        <Flex direction="column" gap="4" style={{ minHeight: 0 }}>
          <Card>
            <Flex justify="between" align="center" mb="2">
              <Heading size="3">Class Average</Heading>
              <Text size="6" weight="bold">--%</Text>
            </Flex>
            <Placeholder label="Pie chart (grade distribution)" />
          </Card>
          <Card>
            <Flex justify="between" align="center" mb="2">
              <Heading size="3">Selected Student Grade</Heading>
              <Text size="5" weight="bold">--%</Text>
            </Flex>
            <Placeholder label="Bar chart (by subject)" />
          </Card>
        </Flex>

        <Flex direction="column" gap="4" style={{ minHeight: 0 }}>
          <Card>
            <Heading size="3" mb="3">Assign Grade</Heading>
            <Flex direction="column" gap="2">
              <Select.Root defaultValue="student-a">
                <Select.Trigger placeholder="Student" />
                <Select.Content>
                  {placeholderStudents.map((s) => (
                    <Select.Item key={s} value={s.toLowerCase().replace(' ', '-')}>{s}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <TextField.Root placeholder="Subject" />
              <TextField.Root placeholder="Assignment" />
              <TextField.Root placeholder="Score (0–100)" type="number" />
              <Button>Submit</Button>
            </Flex>
          </Card>
          <Card>
            <Heading size="3" mb="2">Growth</Heading>
            <Placeholder label="Line chart (student progress)" minHeight={140} />
          </Card>
        </Flex>
      </Grid>
    </Flex>
  )
}
