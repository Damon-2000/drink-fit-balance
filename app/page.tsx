'use client'
import { Box, Container } from '@mui/material'
import ExerciseToggleList from '@/domain/exercise/components/ExerciseToggleList'

export default function Home() {
  return (
    <Container maxWidth='xs'>
      <Box component='main' sx={{ py: 4 }}>
        <ExerciseToggleList />
      </Box>
    </Container>
  )
}
