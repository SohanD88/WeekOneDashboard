// Class detail page — roster, average grade, teacher grade management
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Card,
  Button,
  TextField,
  Select,
  IconButton,
} from '@radix-ui/themes'
import { getClass, updateClass } from '@/api/classes'
import { getStudents, updateStudent } from '@/api/students'
import { getTeachers, updateTeacher } from '@/api/teachers'
import { createGrade } from '@/api/grades'
import { calculateWeightedAverage, classAverageFrom, letterGradeFor } from '@/lib/grades'
import {
  CATEGORY_WEIGHTS,
  type Grade,
  type GradeCategory,
  type SchoolClass,
  type Student,
  type Teacher,
} from '@/types'

const CATEGORIES = Object.keys(CATEGORY_WEIGHTS) as GradeCategory[]

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

// TODO: replace with teammate's getGradesForClass(classId) when available
async function getGradesForClass(_classId: string): Promise<Grade[]> {
  return []
}

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>()

  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null)
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [enrollPick, setEnrollPick] = useState<string>('')
  const [teacherPick, setTeacherPick] = useState<string>('')

  // Assign-grade form
  const [formStudentId, setFormStudentId] = useState<string>('')
  const [formCategory, setFormCategory] = useState<GradeCategory>('quizzes')
  const [formAssignment, setFormAssignment] = useState('')
  const [formScore, setFormScore] = useState('')

  async function reload() {
    if (!classId) return
    const [c, students, teachers, classGrades] = await Promise.all([
      getClass(classId),
      getStudents(),
      getTeachers(),
      getGradesForClass(classId),
    ])
    setSchoolClass(c)
    setAllStudents(students)
    setAllTeachers(teachers)
    setGrades(classGrades)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  const byName = (a: Student, b: Student) =>
    (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)

  const enrolledStudents = useMemo(
    () => allStudents.filter((s) => schoolClass?.studentIds.includes(s.id)).sort(byName),
    [allStudents, schoolClass],
  )
  const unenrolledStudents = useMemo(
    () => allStudents.filter((s) => !schoolClass?.studentIds.includes(s.id)).sort(byName),
    [allStudents, schoolClass],
  )
  const assignedTeacher = useMemo(
    () => allTeachers.find((t) => t.id === schoolClass?.teacherId) ?? null,
    [allTeachers, schoolClass],
  )
  const unassignedTeachers = useMemo(
    () => allTeachers.filter((t) => t.id !== schoolClass?.teacherId),
    [allTeachers, schoolClass],
  )

  const studentAverages = useMemo(() => {
    const map = new Map<string, number | null>()
    for (const s of enrolledStudents) {
      map.set(s.id, calculateWeightedAverage(grades.filter((g) => g.studentId === s.id)))
    }
    return map
  }, [enrolledStudents, grades])

  const classAverage = useMemo(
    () => classAverageFrom([...studentAverages.values()]),
    [studentAverages],
  )

  const selectedAverage = selectedStudentId ? studentAverages.get(selectedStudentId) ?? null : null

  async function enrollStudent() {
    if (!schoolClass || !enrollPick) return
    const student = allStudents.find((s) => s.id === enrollPick)
    if (!student) return
    await Promise.all([
      updateClass(schoolClass.id, { studentIds: [...schoolClass.studentIds, student.id] }),
      updateStudent(student.id, {
        enrolledClassIds: [...student.enrolledClassIds, schoolClass.id],
      }),
    ])
    setEnrollPick('')
    reload()
  }

  async function unenrollStudent(studentId: string) {
    if (!schoolClass) return
    const student = allStudents.find((s) => s.id === studentId)
    await Promise.all([
      updateClass(schoolClass.id, {
        studentIds: schoolClass.studentIds.filter((id) => id !== studentId),
      }),
      student
        ? updateStudent(studentId, {
            enrolledClassIds: student.enrolledClassIds.filter((id) => id !== schoolClass.id),
          })
        : Promise.resolve(),
    ])
    if (selectedStudentId === studentId) setSelectedStudentId(null)
    reload()
  }

  async function assignTeacher() {
    if (!schoolClass || !teacherPick) return
    const teacher = allTeachers.find((t) => t.id === teacherPick)
    if (!teacher) return
    // Unassign previous teacher first
    const previous = allTeachers.find((t) => t.id === schoolClass.teacherId)
    await Promise.all([
      updateClass(schoolClass.id, { teacherId: teacher.id }),
      updateTeacher(teacher.id, {
        classIds: teacher.classIds.includes(schoolClass.id)
          ? teacher.classIds
          : [...teacher.classIds, schoolClass.id],
      }),
      previous
        ? updateTeacher(previous.id, {
            classIds: previous.classIds.filter((id) => id !== schoolClass.id),
          })
        : Promise.resolve(),
    ])
    setTeacherPick('')
    reload()
  }

  async function unassignTeacher() {
    if (!schoolClass || !assignedTeacher) return
    await Promise.all([
      updateClass(schoolClass.id, { teacherId: '' }),
      updateTeacher(assignedTeacher.id, {
        classIds: assignedTeacher.classIds.filter((id) => id !== schoolClass.id),
      }),
    ])
    reload()
  }

  async function submitGrade() {
    if (!schoolClass || !formStudentId || !formAssignment) return
    const score = Number(formScore)
    if (Number.isNaN(score)) return
    await createGrade({
      studentId: formStudentId,
      classId: schoolClass.id,
      assignmentName: formAssignment,
      category: formCategory,
      score,
    })
    setFormAssignment('')
    setFormScore('')
    reload()
  }

  return (
    <Flex direction="column" gap="4" style={{ flex: 1, minHeight: 0 }}>
      <Flex align="center" gap="3">
        <Button asChild variant="soft" size="2">
          <Link to="/dashboard">← Back to directory</Link>
        </Button>
        <Heading size="5">{schoolClass?.name ?? 'Class'}</Heading>
        {schoolClass && (
          <Text size="2" color="gray">
            {schoolClass.subject} · Period {schoolClass.period}
          </Text>
        )}
      </Flex>

      <Grid columns={{ initial: '1', md: '3' }} gap="4" style={{ flex: 1, minHeight: 0 }}>
        {/* LEFT: Teacher (top) + Students (bottom) */}
        <Flex direction="column" gap="4" style={{ minHeight: 0 }}>
          <Card>
            <Flex justify="between" align="center" mb="3">
              <Heading size="3">Teacher</Heading>
            </Flex>
            {assignedTeacher ? (
              <Flex justify="between" align="center" p="2"
                style={{ borderRadius: 'var(--radius-2)', background: 'var(--gray-a3)' }}
              >
                <Text size="2">
                  {assignedTeacher.firstName} {assignedTeacher.lastName}
                </Text>
                <IconButton size="1" variant="soft" color="red" onClick={unassignTeacher}>
                  ×
                </IconButton>
              </Flex>
            ) : (
              <Text size="2" color="gray">No teacher assigned</Text>
            )}
            <Flex gap="2" mt="3">
              <Box style={{ flex: 1 }}>
                <Select.Root value={teacherPick} onValueChange={setTeacherPick}>
                  <Select.Trigger placeholder="Pick teacher…" />
                  <Select.Content>
                    {unassignedTeachers.map((t) => (
                      <Select.Item key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              <Button onClick={assignTeacher} disabled={!teacherPick}>Assign</Button>
            </Flex>
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', maxHeight: 520 }}>
            <Heading size="3" mb="3">Students</Heading>
            <Flex direction="column" gap="2" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {enrolledStudents.length === 0 && (
                <Text size="2" color="gray">No students enrolled</Text>
              )}
              {enrolledStudents.map((s) => {
                const isSelected = selectedStudentId === s.id
                return (
                  <Flex
                    key={s.id}
                    justify="between"
                    align="center"
                    p="2"
                    onClick={() => setSelectedStudentId(s.id)}
                    style={{
                      borderRadius: 'var(--radius-2)',
                      background: isSelected ? 'var(--indigo-a4)' : 'var(--gray-a3)',
                      cursor: 'pointer',
                    }}
                  >
                    <Text size="2">{s.firstName} {s.lastName}</Text>
                    <IconButton
                      size="1"
                      variant="soft"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation()
                        unenrollStudent(s.id)
                      }}
                    >
                      ×
                    </IconButton>
                  </Flex>
                )
              })}
            </Flex>
            <Flex gap="2" mt="3">
              <Box style={{ flex: 1 }}>
                <Select.Root value={enrollPick} onValueChange={setEnrollPick}>
                  <Select.Trigger placeholder="Pick student…" />
                  <Select.Content>
                    {unenrolledStudents.map((s) => (
                      <Select.Item key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              <Button onClick={enrollStudent} disabled={!enrollPick}>Add</Button>
            </Flex>
          </Card>
        </Flex>

        {/* MIDDLE: Class average + Selected student grade */}
        <Flex direction="column" gap="4" style={{ minHeight: 0 }}>
          <Card>
            <Flex justify="between" align="center" mb="2">
              <Heading size="3">Class Average</Heading>
              <Text size="6" weight="bold">
                {classAverage !== null ? `${classAverage.toFixed(1)}%` : '--'}
                {classAverage !== null && (
                  <Text size="2" color="gray" ml="2">({letterGradeFor(classAverage)})</Text>
                )}
              </Text>
            </Flex>
            <Placeholder label="Pie chart (grade distribution)" />
          </Card>
          <Card>
            <Flex justify="between" align="center" mb="2">
              <Heading size="3">
                {selectedStudentId
                  ? enrolledStudents.find((s) => s.id === selectedStudentId)?.firstName + "'s Grade"
                  : 'Select a Student'}
              </Heading>
              <Text size="5" weight="bold">
                {selectedAverage !== null ? `${selectedAverage.toFixed(1)}%` : '--'}
              </Text>
            </Flex>
            <Placeholder label="Bar chart (by category)" />
          </Card>
        </Flex>

        {/* RIGHT: Assign grade + Growth */}
        <Flex direction="column" gap="4" style={{ minHeight: 0 }}>
          <Card>
            <Heading size="3" mb="3">Assign Grade</Heading>
            <Flex direction="column" gap="2">
              <Select.Root value={formStudentId} onValueChange={setFormStudentId}>
                <Select.Trigger placeholder="Student" />
                <Select.Content>
                  {enrolledStudents.map((s) => (
                    <Select.Item key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Select.Root value={formCategory} onValueChange={(v) => setFormCategory(v as GradeCategory)}>
                <Select.Trigger placeholder="Category" />
                <Select.Content>
                  {CATEGORIES.map((c) => (
                    <Select.Item key={c} value={c}>
                      {c} ({Math.round(CATEGORY_WEIGHTS[c] * 100)}%)
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <TextField.Root
                placeholder="Assignment name"
                value={formAssignment}
                onChange={(e) => setFormAssignment(e.target.value)}
              />
              <TextField.Root
                placeholder="Score (0–100)"
                type="number"
                value={formScore}
                onChange={(e) => setFormScore(e.target.value)}
              />
              <Button onClick={submitGrade} disabled={!formStudentId || !formAssignment || !formScore}>
                Submit
              </Button>
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
