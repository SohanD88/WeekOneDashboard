import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'

import type { SchoolClass, Teacher } from '../types'
import { createClass, getClasses } from '../api/classes'
import { getTeachers } from '../api/teachers'

export default function DashboardPage() {
  const [search, setSearch] = useState('');

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [addClassOpen, setAddClassOpen] = useState(false);
  const [className, setClassName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function refreshClasses() {
    try {
      const data = await getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Error loading classes:', error)
      setClasses([])
    }
  }

  async function refreshTeachers() {
    try {
      const data = await getTeachers()
      setTeachers(data)
    } catch (error) {
      console.error('Error loading teachers:', error)
      setTeachers([])
    }
  }

  useEffect(() => {
    refreshClasses()
    refreshTeachers()
  }, [])

  async function handleAddClass() {
    if (!className.trim()) return

    setIsSaving(true)
    try {
      await createClass({
        name: className.trim(),
        subject: 'General',
        teacherId: '',
        studentIds: [],
        period: '1',
        schoolYear: `${new Date().getFullYear()}`,
        averageGrade: null,
        averageLetterGrade: null,
      })

      setClassName('')
      setAddClassOpen(false)
      await refreshClasses()
    } catch (error) {
      console.error('Error adding class:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const teacherMap = useMemo(() => {
    const map: Record<string, string> = {}
    teachers.forEach((teacher) => {
      map[teacher.id] = teacher.firstName + ' ' + teacher.lastName
    })
    return map
  }, [teachers])

  const filteredClasses = useMemo(
    () =>
      classes.filter((item) =>
        [item.name, item.id, teacherMap[item.teacherId]]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search, classes, teacherMap],
  )

  return (
    <Card>
      <Flex align="center" justify="between" gap="4" style={{ width: '100%' }}>
        <Text size="6" weight="bold">
          Class Dashboard
        </Text>
        <Button size="2" onClick={() => setAddClassOpen((value) => !value)}>
          {addClassOpen ? 'Cancel' : 'Add class'}
        </Button>
      </Flex>

      <Flex align="center" justify="center" gap="4">
        <Card style={{ width: '80%', margin: '1rem 0', display: 'flex', alignItems: 'center', padding: '0.5rem 1rem' }}>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search classes, codes, or teachers"
            aria-label="Search classes"
            style={{ width: '90%' }}
          />
        </Card>
      </Flex>

      {addClassOpen ? (
        <Card style={{ margin: '1rem auto', width: '100%', maxWidth: '560px' }}>
          <Flex direction="column" gap="3" style={{ width: '100%' }}>
            <TextField.Root
              placeholder="Class name"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
            />
            <Flex justify="end" gap="2">
              <Button variant="soft" color="gray" onClick={() => setAddClassOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClass} disabled={!className.trim() || isSaving} loading={isSaving}>
                Save class
              </Button>
            </Flex>
          </Flex>
        </Card>
      ) : (
        <Card>
        {filteredClasses.map((classItem) => (
          <Card
            key={classItem.id}
            style={{ cursor: 'pointer', overflow: 'hidden' }}
          >
            <Link
              to={`/classes/${classItem.id}`}
              style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
            >
              <Flex
                align="center"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr repeat(3, minmax(160px, 1fr))',
                  gap: '1rem',
                }}
              >
                <Text size="5" weight="bold">
                  {classItem.name}
                </Text>
                <Text size="2">
                  Teacher: {teacherMap[classItem.teacherId] || classItem.teacherId}
                </Text>
                <Text size="2">
                  Roster Size: {classItem.studentIds.length}
                </Text>
                <Text size="2">
                  Avg Grade: {classItem.averageLetterGrade}
                </Text>
              </Flex>
            </Link>
          </Card>

        ))}

        {filteredClasses.length === 0 && (
          <Card>
            <Text size="3">No classes match your search.</Text>
          </Card>
        )}
      </Card>
      )
    }
    </Card>
  )
}
