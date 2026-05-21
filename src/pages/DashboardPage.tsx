import { useEffect, useState, useMemo } from 'react'
import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'

import type { SchoolClass, Teacher } from '../types'
import { getClasses } from '../api/classes'
import { getTeachers } from '../api/teachers'

export default function DashboardPage() {
  const [search, setSearch] = useState('')

  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getClasses()
        setClasses(data)
      } catch (error) {
        console.error('Error loading classes:', error)
        setClasses([])
      }
    }

    async function loadTeachers() {
      try {
        const data = await getTeachers()
        setTeachers(data)
      } catch (error) {
        console.error('Error loading teachers:', error)
        setTeachers([])
      }
    }

    loadClasses()
    loadTeachers()
  }, [])

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
        [item.name, item.id, item.teacherId, teacherMap[item.teacherId]]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search, classes, teacherMap],
  )

  return (
    <Card>
      <Text size="6" weight="bold">
        Class Dashboard
      </Text>
      <Flex align="center" justify="center" gap="4">

        <Card style={{ width: '80%' }}>
          <MagnifyingGlassIcon/>
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

      <Card>
        {filteredClasses.map((classItem) => (
          <Card>
            <Flex
              key={classItem.id}
              align="center"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr repeat(3, minmax(160px, 1fr))',
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
          </Card>

        ))}

        {filteredClasses.length === 0 && (
          <Card>
            <Text size="3">No classes match your search.</Text>
          </Card>
        )}
      </Card>
    </Card>
  )
}
