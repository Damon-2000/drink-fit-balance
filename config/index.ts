// 環境設定：由 NEXT_PUBLIC_ 環境變數提供，未設定時使用預設值
export const apiConfig = {
  // 空字串代表與前端同源；本專案部署為靜態網站，日後若有後端必須是獨立服務
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  // 預設使用 Mock，只有明確設為 'false' 時才呼叫真實 API
  useMock: process.env.NEXT_PUBLIC_USE_MOCK !== 'false',
}
