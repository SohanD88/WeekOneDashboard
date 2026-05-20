import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'

import { getClasses } from '../api/classes'
import type { SchoolClass } from '../types'

export default function HomePage() {
  const [classes, setClasses] = useState<SchoolClass[]>([])

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

    loadClasses()
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f8fb',
        padding: '32px',
      }}
    >
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <Text size="4" weight="bold">
          Welcome Back, Admin
        </Text>

        <Flex gap="6" mt="6" align="start">
          <div style={{ flex: 1 }}>
            <Card size="3">
              <Heading size="4" mb="2">
                Your Classes
              </Heading>

              {classes.length === 0 ? (
                <Text as="p" color="gray">
                  No classes available yet.
                </Text>
              ) : (
                classes.slice(0, 3).map((schoolClass) => (
                  <Text as="p" key={schoolClass.id}>
                    {schoolClass.name}
                  </Text>
                ))
              )}
            </Card>

            <img
              src="/thomas-jefferson-school.jpeg"
              alt="Thomas Jefferson Elementary"
              style={{
                width: '100%',
                height: '260px',
                objectFit: 'cover',
                borderRadius: '24px',
                marginTop: '40px',
              }}
            />
          </div>

          <div style={{ flex: 2 }}>
            <Card size="3">
              <Heading size="5" mb="2">
                Thomas Jefferson Elementary
              </Heading>

              <Text as="p" color="gray" mb="4">
                Dashboard for managing students,
                teachers, classes, grades, and school events.
              </Text>

              <Button asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </Card>

            <Text as="p" mt="4" color="gray">
              Thomas Jefferson Elementary is moving from paper records to a digital
              dashboard. This application helps administrators and teachers manage
              enrollment, classrooms, grades, and school events, while giving students
              and parents easier access to important information and updates.
            </Text>
          </div>
        </Flex>
      </section>
    </main>
  )
}