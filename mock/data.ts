import type { Exercise } from '@/domain/exercise/schema'

// API-03：運動表
// 以下為範例資料，MET 值與來源須由學生查證後替換（product-spec 待確認事項）
export const mockExercises: Exercise[] = [
  { id: 'jogging', name: '慢跑', met: 7, source: '範例值，待查證' },
  { id: 'brisk-walking', name: '快走', met: 4.3, source: '範例值，待查證' },
  { id: 'cycling', name: '騎腳踏車', met: 6.8, source: '範例值，待查證' },
  { id: 'swimming', name: '游泳', met: 6, source: '範例值，待查證' },
  { id: 'jump-rope', name: '跳繩', met: 11, source: '範例值，待查證' },
]
