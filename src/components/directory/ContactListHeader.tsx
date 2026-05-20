import { Box, Flex, Grid, Separator, Text } from '@radix-ui/themes'

export default function ContactListHeader() {
  return (
    <>
      <Flex align="center" gap="4" px="4">
        <Grid columns="1.5fr 2fr 1fr 2.5fr 1fr 0.5fr" gap="6" flexGrow="1">
          <Text size="1" weight="bold" color="gray">Name</Text>
          <Text size="1" weight="bold" color="gray">Email</Text>
          <Text size="1" weight="bold" color="gray">Phone Number</Text>
          <Text size="1" weight="bold" color="gray">Address</Text>
          <Text size="1" weight="bold" color="gray">Role</Text>
          <Text size="1" weight="bold" color="gray">Class</Text>
        </Grid>
        <Box width="20px" />
      </Flex>
      <Separator size="4" />
    </>
  )
}
