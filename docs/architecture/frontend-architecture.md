# Frontend Architecture

## 1. 文件目的

本文件定義 醉後比較 前端專案的技術選型、目錄結構、各層職責與 Mock 機制，作為學生與 AI Agent 實作時必須遵守的框架。

- 功能行為以 `docs/spec/product-spec.md` 為準。
- API 格式以 `docs/architecture/api-contracts.md` 為準。
- 本文件只規範「程式碼放在哪裡、由誰負責」，不定義業務規則。

若實作需求無法套入本文件的結構，應先記錄問題並確認，不得自行新增平行的架構或函式庫。

---

## 2. 技術選型

| 類別       | 使用技術                                | 職責                                     |
| ---------- | --------------------------------------- | ---------------------------------------- |
| 框架       | Next.js（App Router）                   | 路由與頁面組裝                           |
| UI         | Material UI                             | 介面元件                                 |
| HTTP       | axios                                   | 定義 HTTP 請求介面                       |
| 資源取用   | SWR                                     | 以 hooks 控制資源取用、輪詢與相關商業邏輯 |
| 通用狀態   | zustand                                 | 跨元件共用的前端狀態                     |
| 型別       | TypeScript                              | Request、Response 與資料模型的型別       |

### 2.1 不使用的技術

除非有明確理由並經確認，否則不得引入：

- 其他資料請求方式：直接使用 `fetch`、React Query、Apollo 等。
- 其他狀態管理：Redux、Jotai、以 React Context 保存伺服器資料等。
- Mock 工具：MSW、json-server、Mirage 等自動化 Mock 方案。
- 測試框架：Jest、Vitest、Testing Library、Playwright 等（驗證方式見 `development-plan.md` §3.5）。
- 執行期 Schema 驗證函式庫：zod、yup 等。

新增任何相依套件前，應說明用途、替代方案及影響，並記錄於對應工作區塊的 Plan Changes。

---

## 3. 渲染模式

### 3.1 現階段規則

本專案現階段以 Client Component 為主：

- `app/layout.tsx` 保留為 Server Component，只負責 `metadata`、字型與全域 Provider。
- 頁面與功能元件均為 Client Component，於檔案開頭宣告 `'use client'`。
- 所有資料皆由瀏覽器端透過 SWR hooks 取得。
- 不使用 Server Actions、Route Handlers、Server Component 資料取得或伺服器端快取 API。

### 3.2 部署限制：GitHub Pages 靜態網站

本專案部署到 GitHub Pages，執行時沒有 Node.js 伺服器。`next.config.ts` 設定為 `output: 'export'`，`npm run build` 只輸出靜態檔案到 `out/`。

因此以下功能一律不得使用（大多數會在 `npm run dev` 或 `npm run build` 時直接報錯）：

- Server Actions、Route Handlers（`app/**/route.ts`）、Proxy（`proxy.ts`）。
- 動態路由（`app/**/[param]/`）。頁面之間需要傳遞的資料放在 zustand store，不放在網址路徑中。
- `cookies()`、`headers()` 等需要請求內容的函式，以及 `next.config.ts` 的 redirects、rewrites、headers。
- `'use cache'`、`cacheComponents` 等伺服器端快取功能。
- `next/image` 的預設圖片最佳化（已設定 `images.unoptimized`）。

設定檔無法攔下所有情況。例如只處理 POST 的 Route Handler 仍可以建置成功，但不會出現在 `out/` 中，部署後該網址並不存在。因此每次 `npm run build` 後都要檢查輸出的 Route 清單：**所有路由都必須標示為 `○ (Static)`**，出現 `ƒ (Dynamic)` 就代表使用了 GitHub Pages 無法提供的功能，必須移除。

Server Component 在靜態輸出時會在建置階段執行一次，設定檔同樣無法阻擋它；本專案依 §3.1 只在 `app/layout.tsx` 使用 Server Component，其他檔案都必須是 Client Component。

GitHub Pages 的網址為 `https://<帳號>.github.io/<repo>/`，所以部署時要以 `NEXT_PUBLIC_BASE_PATH=/<repo>` 建置。頁面之間的連結一律使用 `next/link`，會自動加上 basePath；不得在程式碼中寫死以 `/` 開頭的站內網址。

### 3.3 保留的後端彈性

GitHub Pages 無法執行伺服器程式，因此後端日後若存在，只能是獨立服務，前端透過設定的 Base URL 呼叫。

為保留這個可能，前端只依賴 `api-contracts.md` 中的 Method、Path 與資料格式，並透過 `config/` 提供的 Base URL 發送請求。UI、hooks 與 stores 不得知道後端的實作位置。

---

## 4. 目錄結構

```text
app/                     路由與頁面組裝
components/              跨 domain 共用的 UI（Layout、Loading / Error / Empty、通知）
config/                  規格數值、前端設定預設值與環境設定
domain/
  <resource>/            以資源為單位的目錄
    schema.ts            該資源的 TypeScript 型別
    api.ts               該資源的 HTTP 請求函式
    hooks.ts             該資源的 SWR hooks
    store.ts             該資源的 zustand store（僅在需要時建立）
    calc.ts              該資源的計算純函式（僅在需要時建立，見 §5.8）
    components/          僅該資源使用的 UI 元件（僅在需要時建立）
lib/
  http.ts                共用的 axios instance
mock/
  data.ts                靜態 Mock 資料
  utils.ts               Mock 輔助函式（例如 sleep）
styles/                  MUI theme
```

### 4.1 Domain 資源

`domain/` 下以資源為目錄，目錄名稱使用 kebab-case 單數名詞。建議資源如下，對應 `api-contracts.md` 的 API 清單：

| 目錄                    | 對應 API | 說明                                                         |
| ----------------------- | -------- | ------------------------------------------------------------ |
| `domain/drink`          | API-01   | 酒款表、篩選與隨機抽選、每筆熱量計算                         |
| `domain/container`      | API-02   | 容器表、ml 與 fl oz 換算                                     |
| `domain/exercise`       | API-03   | 運動表、運動代償換算                                         |
| `domain/drink-session`  | 無       | 進行中的一輪與前一輪紀錄（localStorage）、累計、判定、熱量最高兇手 |
| `domain/settings`       | 無       | 身高體重、運動開關（localStorage）                           |

各資源視需要包含 `schema.ts`、`api.ts`、`hooks.ts`、`store.ts`、`calc.ts`，不需要為了格式一致建立空檔案。若 API 切分調整，應同步更新本表。

---

## 5. 各層職責

### 5.1 資料流

```text
Component  →  hooks.ts (SWR)  →  api.ts  →  lib/http.ts (axios)  →  Backend
                                    └──────→  mock/（Mock 模式）
Component  ↔  store.ts (zustand)
```

依賴方向只能由左至右。下層不得引用上層，例如 `api.ts` 不得引用 hooks 或元件。

### 5.2 `schema.ts`：型別

- 依 `api-contracts.md` 定義 Request、Response 與資料模型的型別。
- 欄位名稱、可為空值的欄位及列舉值必須與契約一致。
- 契約尚未定義的欄位，先在 `api-contracts.md` 以 `Proposed` 補上，再撰寫型別，不得反向以程式碼定義契約。

### 5.3 `api.ts`：HTTP 請求介面

- 每個 API 契約對應一個函式，命名以動作開頭，例如 `getDeviceStatus`、`updateOutletState`。
- 使用 `lib/http.ts` 的共用 axios instance，不得各自建立 instance。
- 參數與回傳值使用 `schema.ts` 的型別，回傳解開後的資料本體。
- 只負責發送請求與轉換格式，不包含 React、UI 狀態或業務判斷。
- Mock 模式下改為回傳 Mock 資料（見 §6）。

### 5.4 `lib/http.ts`：共用 axios instance

- 設定 Base URL、逾時時間與共用標頭，數值來自 `config/`。
- 統一將錯誤轉換為一致的前端錯誤型別，供 hooks 與 UI 判斷。
- 不包含任何特定資源的邏輯。

### 5.5 `hooks.ts`：資源取用與商業邏輯

- 以 SWR 取得資源；元件只能透過 hooks 取得資料或觸發操作，不得直接呼叫 `api.ts`。
- SWR key 在同一資源內集中定義，避免散落的字串。
- 輪詢間隔、資料過期判斷、操作中狀態及操作後的重新取得（revalidate），都在 hooks 中處理。
- 寫入操作使用 SWR 的 mutation 機制，完成後重新取得相關資源；不得只因請求成功，就直接改寫成後端或外部系統已完成的狀態。
- 從伺服器取得的資料以 SWR 快取為唯一來源，不另外複製到 zustand。

### 5.6 `store.ts`：通用狀態

zustand 只保存前端自己擁有的狀態，例如：

- 使用者的前端本地設定（見 §7）。
- 跨元件共用的 UI 狀態，例如全域通知佇列、目前選擇的篩選條件。

不得將 API 回應資料存入 zustand 作為第二份副本。

寫法規則：

- store 只定義狀態，不在 store 內定義修改函式（action）。
- 修改狀態的函式定義在 store 之外，以 `useXxxStore.setState()` 實作並匯出，例如 `setPollingInterval()`。
- 元件以 selector 讀取需要的狀態，例如 `useSettingsStore((state) => state.pollingInterval)`；修改時直接呼叫匯出的函式。

如此修改函式不受 hook 規則限制，可在事件處理、SWR callback 等任何地方呼叫，元件也不必為了取得函式而訂閱 store。

### 5.7 `components/` 與 `app/`

- `app/` 只負責路由與頁面組裝，避免在頁面檔案中撰寫資料邏輯。
- 共用元件放在根目錄 `components/`；只被單一資源使用的元件放在該資源的 `components/`。
- 元件不得出現魔術數字或寫死的規格數值，應從 `config/` 取得。

### 5.8 `calc.ts`：計算純函式

本專案的熱量、運動代償、血量判定與熱量最高兇手都在前端計算，集中放在各資源的 `calc.ts`：

- 只寫純函式：輸入資料，回傳結果；不讀寫 localStorage、不呼叫 hooks、不引用元件。
- 規格數值（例如四捨五入規則、門檻）從 `config/` 取得，不寫死在函式內。
- hooks 與元件呼叫 `calc.ts` 取得結果，不在元件中自行計算。
- 依賴方向：`calc.ts` 只能引用同層或其他資源的 `schema.ts`、`calc.ts` 與 `config/`。

這樣學生可以單獨閱讀、手算比對每一個計算，驗證時也能清楚指出算錯的地方。

---

## 6. Mock 機制

本專案沒有後端，酒款表、容器表與運動表以靜態 Mock 資料提供，Mock 開關恆開。需要新增酒款、容器或運動時，直接修改 `mock/` 中的資料。Mock 機制刻意保持簡單，以利學生理解。

### 6.1 運作方式

- `mock/data.ts`：存放符合 `schema.ts` 型別的靜態資料。
- `mock/utils.ts`：提供 `sleep` 等輔助函式，用於模擬網路延遲。
- `api.ts` 依 `config/` 的 Mock 開關，決定呼叫 axios 或以 `sleep` 包覆後回傳 Mock 資料。
- Mock 資料必須宣告為對應的型別，讓型別檢查能發現與契約不一致的地方。

### 6.2 限制

- 不建立會記憶寫入結果的動態 Mock，寫入操作只回傳固定的模擬結果。因此在 Mock 模式下，寫入後重新取得的資料可能不會改變，屬於已知限制。
- 不使用隨機失敗或自動化情境切換。需要驗證失敗、逾時、空資料等情境時，以手動修改 Mock 資料或 `config/` 中的開關來重現，並在 Verification Notes 記錄使用的情境。
- Mock 資料不代表後端已實作，也不代表契約已確認。

### 6.3 Mock 模式提示

Mock 模式下，介面必須有明確標示，避免模擬結果被誤認為真實資料。本專案以 AppBar 中的小字「靜態資料模式」呈現。

---

## 7. 使用者的前端本地設定

由於目前不存在後端，所有使用者資料（身高體重、運動開關）與飲酒紀錄皆作為純前端狀態處理：

- 身高體重與運動開關放在 `domain/settings/store.ts`；進行中的一輪與前一輪紀錄放在 `domain/drink-session/store.ts`。兩者都以 zustand 管理。
- 預設值與可選範圍定義於 `config/`。
- 以 zustand 的 `persist` 保存於 localStorage，不建立對應的 API。
- localStorage 可能被清除或內容損毀；讀到不合法的內容時，視為沒有資料並回到初始狀態，不得讓畫面當掉。
- 保存格式變動時，調整 `persist` 的 `version`，避免舊格式造成錯誤。
- 若未來改為保存於後端，須先於 `api-contracts.md` 新增契約。

這些資料只保存在使用者自己的瀏覽器中，不會傳送到任何外部服務。

---

## 8. `config/` 規則

`config/` 統一管理規格數值、前端設定預設值與環境設定，例如：

- 身高、體重、熱量目標的有效範圍（product-spec 需求 5、22）。
- 醉後底線低血量提示的門檻百分比（暫定 20%，product-spec 需求 23a）。
- 杯數的有效範圍（暫定，待確認）。
- 數值顯示精度（product-spec 需求 29）與 fl oz 換算係數。
- 版型寬度：最小 375px、最大 480px（product-spec 需求 31）。
- localStorage 的保存鍵名與格式版本。
- API Base URL 與 Mock 開關。

規則：

- `config/index.ts` 只放環境設定；其他數值依主題分檔，例如 `config/polling.ts`。
- 每個數值需以註解標示來源：`product-spec` 已明定的值，或暫定值。
- 暫定值需在註解中說明，並對應 `api-contracts.md` Open Questions 或 `development-plan.md` Blockers 中的條目。
- 環境相關設定透過 `NEXT_PUBLIC_` 開頭的環境變數讀取，並在 `config/` 中提供預設值；不得將機密資訊放入前端環境變數。
- 修改暫定值不需要修改產品規格，但若影響業務規則，應先確認。
