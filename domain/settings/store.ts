import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageConfig } from '@/config/storage'

type SettingsState = {
  // 記錄「關閉」而不是「開啟」的運動，運動表新增項目時預設就是開啟
  disabledExerciseIds: string[]
}

// 使用者的前端本地設定，沒有對應的 API，以 persist 保存到 localStorage
export const useSettingsStore = create<SettingsState>()(
  persist(() => ({ disabledExerciseIds: [] as string[] }), {
    name: storageConfig.settingsKey,
    version: storageConfig.settingsVersion,
  }),
)

// 修改狀態的函式定義在 store 之外，不受 hook 規則限制，元件也不需要訂閱它
export function toggleExercise(id: string) {
  useSettingsStore.setState((state) => ({
    disabledExerciseIds: state.disabledExerciseIds.includes(id)
      ? state.disabledExerciseIds.filter((disabledId) => disabledId !== id)
      : [...state.disabledExerciseIds, id],
  }))
}
