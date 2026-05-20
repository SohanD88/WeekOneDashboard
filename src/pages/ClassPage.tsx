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
import { createGrade, deleteGrade, getGradesByClass, updateGrade } from '@/api/grades'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
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
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/*
Current Classes:
ID	Name
2q9rJTPoiqc4w6qjgCU5	Intermediate Math (Math, 1st)
KnttGOBIALBcx4T3IGEB	Advanced Math (Math, 2nd)
MpKVfexIb0u784TlFDzk	Beginning Reading (English, 3rd)
UOrCPWR2dRUIwmO1emho	Reading & Writing (English, 2nd)
UWMl1IbQB5iEKqwF3WRC	Science Explorers (Science, 3rd)
eFMw4xLcXNd8tg2gF72Z	Art Studio (Art, 5th)
eTmc8i4uEV1ixd9BVwZM	Math Fundamentals (Math, 1st)
gOPw0f0terEshpFYgYe2	Physical Education (PE, 6th)
iU8QIIXJosGgO1AMKTGW	Intro to Science (Science, 2nd)
q91c6dsy2TBA6m4HSlNH	Music Makers (Music, 5th)
rQLkG4fuKMNmAsZjJFrp	Creative Writing (English, 4th)
wKSfafxTPe1bNWeXebeD	Our Community (Social Studies, 4th)
*/

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
      getGradesByClass(classId),
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

  // Pie chart: distribution of letter grades across enrolled students.
  const LETTER_COLORS: Record<string, string> = {
    A: 'var(--green-9)',
    B: 'var(--blue-9)',
    C: 'var(--yellow-9)',
    D: 'var(--orange-9)',
    F: 'var(--red-9)',
  }
  const gradeDistribution = useMemo(() => {
    const buckets: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    for (const avg of studentAverages.values()) {
      const letter = letterGradeFor(avg)
      if (letter) buckets[letter] += 1
    }
    return Object.entries(buckets)
      .filter(([, count]) => count > 0)
      .map(([letter, count]) => ({ name: letter, value: count }))
  }, [studentAverages])

  // Bar chart: selected student's average score per category.
  const studentGrades = useMemo(
    () => (selectedStudentId ? grades.filter((g) => g.studentId === selectedStudentId) : []),
    [grades, selectedStudentId],
  )
  const categoryBreakdown = useMemo(() => {
    return CATEGORIES.map((c) => {
      const inCat = studentGrades.filter((g) => g.category === c)
      const avg = inCat.length === 0 ? 0 : inCat.reduce((s, g) => s + g.score, 0) / inCat.length
      return { category: capitalize(c), average: Number(avg.toFixed(1)) }
    })
  }, [studentGrades])

  async function changeGradeScore(gradeId: string, newScore: number) {
    if (Number.isNaN(newScore)) return
    await updateGrade(gradeId, { score: newScore })
    reload()
  }
  async function removeGrade(gradeId: string) {
    await deleteGrade(gradeId)
    reload()
  }

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
    <Flex direction="column" gap="4" style={{ height: 'calc(100vh - 110px)' }}>
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

          <Card style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
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
          <Card style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Flex justify="between" align="center" mb="2">
              <Heading size="3">Class Average</Heading>
              <Text size="6" weight="bold">
                {classAverage !== null ? `${classAverage.toFixed(1)}%` : '--'}
                {classAverage !== null && (
                  <Text size="2" color="gray" ml="2">({letterGradeFor(classAverage)})</Text>
                )}
              </Text>
            </Flex>
            {gradeDistribution.length === 0 ? (
              <Placeholder label="No grades yet" />
            ) : (
              <Flex style={{ flex: 1, minHeight: 0 }} align="center" gap="2">
                <Flex direction="column" gap="1">
                  {[
                    { letter: 'A', range: '90–100' },
                    { letter: 'B', range: '80–89' },
                    { letter: 'C', range: '70–79' },
                    { letter: 'D', range: '60–69' },
                    { letter: 'F', range: '0–59' },
                  ].map(({ letter, range }) => (
                    <Flex key={letter} align="center" gap="2">
                      <Box
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: LETTER_COLORS[letter],
                        }}
                      />
                      <Text size="1" weight="bold">{letter}</Text>
                      <Text size="1" color="gray">{range}</Text>
                    </Flex>
                  ))}
                </Flex>
                <Box style={{ flex: 1, minHeight: 0, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeDistribution}
                        dataKey="value"
                        nameKey="name"
                        label={(d) => `${d.name}: ${d.value}`}
                      >
                        {gradeDistribution.map((d) => (
                          <Cell key={d.name} fill={LETTER_COLORS[d.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Flex>
            )}
          </Card>
          <Card style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
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
            {!selectedStudentId ? (
              <Placeholder label="Select a student to see their breakdown" />
            ) : (
              <Box style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown}>
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="average" fill="var(--indigo-9)" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
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
                      {capitalize(c)} ({Math.round(CATEGORY_WEIGHTS[c] * 100)}%)
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
          <Card style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Heading size="3" mb="2">
              {selectedStudentId
                ? `${enrolledStudents.find((s) => s.id === selectedStudentId)?.firstName}'s Assignments`
                : 'Assignments'}
            </Heading>
            {!selectedStudentId ? (
              <Text size="2" color="gray">Select a student to see their assignments.</Text>
            ) : studentGrades.length === 0 ? (
              <Text size="2" color="gray">No assignments yet.</Text>
            ) : (
              <Flex direction="column" gap="3" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {CATEGORIES.map((cat) => {
                  const inCat = studentGrades.filter((g) => g.category === cat)
                  if (inCat.length === 0) return null
                  return (
                    <Box key={cat}>
                      <Text size="1" weight="bold" color="gray" style={{ textTransform: 'uppercase' }}>
                        {capitalize(cat)}
                      </Text>
                      <Flex direction="column" gap="1" mt="1">
                        {inCat.map((g) => (
                          <Flex
                            key={g.id}
                            justify="between"
                            align="center"
                            gap="2"
                            p="2"
                            style={{ borderRadius: 'var(--radius-2)', background: 'var(--gray-a2)' }}
                          >
                            <Text size="2" style={{ flex: 1 }}>{g.assignmentName}</Text>
                            <TextField.Root
                              size="1"
                              type="number"
                              defaultValue={g.score}
                              style={{ width: 70 }}
                              onBlur={(e) => {
                                const v = Number(e.target.value)
                                if (v !== g.score) changeGradeScore(g.id, v)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                              }}
                            />
                            <IconButton
                              size="1"
                              variant="soft"
                              color="red"
                              onClick={() => removeGrade(g.id)}
                            >
                              ×
                            </IconButton>
                          </Flex>
                        ))}
                      </Flex>
                    </Box>
                  )
                })}
              </Flex>
            )}
          </Card>
        </Flex>
      </Grid>
    </Flex>
  )
}
