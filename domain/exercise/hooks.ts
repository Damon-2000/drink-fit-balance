import useSWR from 'swr'
import { useSettingsStore } from '@/domain/settings/store'
import { getExercises } from './api'
import { resolveEnabledExercises } from './calc'

const EXERCISES_KEY = '/api/v1/exercises'

export function useExercises() {
  const { data, error, isLoading } = useSWR(EXERCISES_KEY, getExercises)

  return {
    exercises: data,
    isLoading,
    hasError: Boolean(error),
  }
}

export function useExerciseToggles() {
  const { exercises, isLoading, hasError } = useExercises()
  const disabledIds = useSettingsStore((state) => state.disabledExerciseIds)

  return {
    exercises,
    isLoading,
    hasError,
    disabledIds,
    // 運動表還沒取得時無法判斷，回傳 undefined 而不是空陣列，避免畫面誤以為沒有運動
    enabledExercises: exercises && resolveEnabledExercises(exercises, disabledIds),
    // 只計算運動表中存在的項目，舊的設定殘留不影響判斷
    isAllDisabled: Boolean(exercises?.length && exercises.every((exercise) => disabledIds.includes(exercise.id))),
  }
}
