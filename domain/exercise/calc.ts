import type { Exercise } from './schema'

// 依使用者的開關算出實際採用的運動（product-spec 需求 8）
// 保留運動表的順序，因為即時換算要顯示「第一個已開啟的運動」（需求 21）
export function resolveEnabledExercises(exercises: Exercise[], disabledIds: string[]): Exercise[] {
  const enabled = exercises.filter((exercise) => !disabledIds.includes(exercise.id))
  // 全部關閉視同全部開啟
  return enabled.length > 0 ? enabled : exercises
}
