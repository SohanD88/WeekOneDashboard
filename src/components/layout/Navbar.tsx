import { NavLink } from 'react-router-dom'
import { Flex, Text, Box } from '@radix-ui/themes'

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/calendar', label: 'Calendar' },
]

export default function Navbar() {
  return (
    <Box asChild style={{ borderBottom: '1px solid var(--gray-a5)' }}>
      <nav aria-label="Top navigation">
        <Flex align="center" gap="4" px="5" py="3">
          <Text size="4" weight="bold" color="indigo" mr="auto">
            Thomas Jefferson Elementary
          </Text>
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <Text
                  size="2"
                  weight={isActive ? 'bold' : 'regular'}
                  color={isActive ? 'indigo' : 'gray'}
                >
                  {label}
                </Text>
              )}
            </NavLink>
          ))}
        </Flex>
      </nav>
    </Box>
  )
}
