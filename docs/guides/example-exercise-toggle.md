# 範例模組：運動代償開關清單

## 1. 這個範例的用途

這是 FE-04 的一小部分，示範一個功能如何依 `frontend-architecture.md` 的結構，從契約一路做到畫面。

- 範例只做「讀取運動表、逐項開關運動代償類型、全關視同全開，並把開關保存到 localStorage」。
- 範例不是 FE-04 的完成品，不要在範例上繼續擴充。
- 你的任務是讀懂範例後**重置**它，再與 AI Agent 一步一步重新完成。

FE-04 的其餘範圍（每個畫面右上角的設定入口、設定面板本身、修改身高體重）不在範例內，重置後依 `development-plan.md` 自行完成。

這個範例同時示範本專案的兩條資料線：

- **SWR 讀取靜態資料**：運動表從 `mock/` 經過 `api.ts`、hooks 到畫面。
- **zustand `persist` 保存使用者設定**：開關狀態寫進 localStorage，重新整理後仍然保留。

---

## 2. 檔案與概念

每個檔案只負責一個概念，建議依照下表順序閱讀：

| 順序 | 檔案 | 概念 |
| ---- | ---- | ---- |
| 1    | `docs/architecture/api-contracts.md` 的 API-03 | 先有契約，才有程式碼 |
| 2    | `domain/exercise/schema.ts` | 用型別表達契約 |
| 3    | `mock/data.ts`、`mock/utils.ts` | 符合型別的靜態資料與延遲 |
| 4    | `config/storage.ts` | 規格數值集中管理，並標示來源 |
| 5    | `domain/exercise/api.ts` | 一個契約一個函式，切換 Mock 或真實 API |
| 6    | `domain/exercise/calc.ts` | 業務規則（全關視同全開）寫成純函式，可以單獨閱讀與手算 |
| 7    | `domain/settings/store.ts` | zustand 保存前端本地設定，`persist` 寫入 localStorage，修改函式定義在 store 之外 |
| 8    | `domain/exercise/hooks.ts` | 集中 SWR key，把伺服器狀態（運動表）與用戶端狀態（開關）組合起來，畫面不必自己判斷 |
| 9    | `domain/exercise/components/ExerciseToggleList.tsx` | 元件只透過 hooks 取得資料 |
| 10   | `app/page.tsx` | 頁面只負責組裝 |

閱讀時試著回答：

- 資料從哪裡來？依序經過哪些檔案才到畫面上？
- 如果改成真實後端，需要修改哪些檔案？哪些完全不用動？
- 為什麼 store 記錄的是「關閉的運動」，而不是「開啟的運動」？運動表新增一項運動時，兩種做法的結果有什麼不同？
- 「全關視同全開」為什麼放在 `calc.ts`，而不是寫在元件的 JSX 裡？之後 FE-07 的運動換算要怎麼重用它？
- 運動表還沒取得時，`enabledExercises` 為什麼是 `undefined` 而不是 `[]`？

---

## 3. 動手觀察

1. 執行 `npm run dev`，開啟 <http://localhost:3000>。先看到載入中，約 0.5 秒後出現運動清單，全部為開啟，右上角顯示「靜態資料模式」。
2. **觀察保存**：關閉「慢跑」，下方的「實際採用」立即少了慢跑。重新整理頁面後，慢跑仍是關閉。打開瀏覽器開發者工具 → Application → Local Storage，找到 `drink-fit-balance:settings`，看看保存的內容。
3. **觀察全關視同全開**：把所有運動都關閉，畫面出現「目前全部關閉，運動代償會視同全部開啟」，「實際採用」列出全部運動。
4. **重現資料被清除**：在開發者工具中刪除 `drink-fit-balance:settings` 後重新整理，所有運動回到開啟。
5. **重現空資料**：暫時把 `mock/data.ts` 的 `mockExercises` 改成空陣列 `[]`，畫面顯示「運動表目前沒有任何運動」。觀察完畢後還原。
6. **重現首次載入失敗**：在 `.env.local` 設定 `NEXT_PUBLIC_USE_MOCK=false` 後重新啟動。因為沒有後端，畫面會顯示「無法取得運動表」。觀察完畢後刪除這行設定。

---

## 4. 重置與重新實作

### 4.1 重置

```bash
git switch -c my-exercise-toggle
```

範例的所有程式碼都集中在專案的最後一個範例 commit 中，可以先查看它包含哪些變更：

```bash
git log --oneline
git show --stat <範例 commit>
```

在自己的分支上刪除以下內容，並把 `app/page.tsx` 還原為只顯示 Hello World 的狀態：

- `domain/exercise/`
- `domain/settings/`
- `config/storage.ts`
- `mock/data.ts` 中的 `mockExercises`，以及它使用的 `Exercise` 匯入（刪除後檔案是空的）

`app/page.tsx` 還原後的內容：

```tsx
import { Box, Container } from '@mui/material'

export default function Home() {
  return (
    <Container>
      <Box component='main'>Hello World</Box>
    </Container>
  )
}
```

`config/index.ts`、`lib/http.ts`、`mock/utils.ts` 屬於共用基礎，不在範例 commit 中，請保留。

需要參考範例時，用 `git show main:<檔案路徑>` 查看原始內容，例如：

```bash
git show main:domain/exercise/hooks.ts
```

### 4.2 重新實作

依 §2 的順序，**每一步只讓 AI Agent 完成一個檔案**，完成後先自己讀懂再進行下一步。例如：

> 依 api-contracts.md 的 API-03，在 domain/exercise/schema.ts 建立型別。只建立這個檔案。

每一步完成後：

1. 執行 `npm run typecheck`，確認沒有型別錯誤。
2. 說得出這個檔案的職責，以及它依賴哪些檔案。
3. 若 Agent 產生的內容超出這一步的範圍，請它移除後再繼續。

全部完成後，依 `development-plan.md` §3.5 執行靜態檢查與功能驗證，再繼續 FE-04 的其餘範圍。

---

## 5. 範例刻意省略的部分

以下內容屬於 FE-01、FE-02 或 FE-04 的工作範圍，範例沒有實作：

- `lib/http.ts` 的統一錯誤轉換。
- 共用的 Loading、Error、Empty 元件與 AppBar 版面。
- 設定面板的入口與開關畫面；範例直接把清單放在首頁。
- 身高體重的保存與修改（之後會加進同一個 `domain/settings/store.ts`，屆時要調整 `persist` 的 `version`）。
- localStorage 內容損毀時的處理（`persist` 的 `migrate` 或讀取失敗的復原），屬於 FE-02 與 FE-10。
- 運動換算公式：範例只顯示運動名稱，沒有使用 `met`。
