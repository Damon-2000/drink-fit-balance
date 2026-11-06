// 對應 api-contracts.md API-03（Proposed）
export type Exercise = {
  id: string
  name: string
  met: number // 代謝當量，正式換算公式待確認（api-contracts.md §8.1）
  source: string // 資料來源，供講師審核
}
