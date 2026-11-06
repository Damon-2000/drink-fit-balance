import { apiConfig } from '@/config'
import { http } from '@/lib/http'
import { mockExercises } from '@/mock/data'
import { sleep } from '@/mock/utils'
import type { Exercise } from './schema'

// API-03：取得運動表
export async function getExercises(): Promise<Exercise[]> {
  if (apiConfig.useMock) {
    await sleep(500)
    return mockExercises
  }

  const response = await http.get<Exercise[]>('/api/v1/exercises')
  return response.data
}
