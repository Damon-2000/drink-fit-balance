# 專案架構與開發指南

這份文件寫給要在本專案上繼續開發的你。它不重複列出規則，而是說明這些規則**為什麼存在**。理解原因之後，遇到文件沒寫到的情況時，你也能做出一致的判斷。

本文件只負責解釋。若內容與規則文件不一致，以規則文件為準，並請回報這處差異。專案的安裝與啟動方式請見 `README.md`。

## 文件地圖

| 想知道的事                         | 去哪裡看                                     |
| ---------------------------------- | -------------------------------------------- |
| 系統應該有什麼行為                 | `docs/spec/product-spec.md`                  |
| 現在該做什麼、怎樣算完成           | `docs/spec/development-plan.md`              |
| 前後端之間的資料長什麼樣子         | `docs/architecture/api-contracts.md`         |
| 程式碼放在哪裡、各層負責什麼（規則） | `docs/architecture/frontend-architecture.md` |
| 為什麼這樣設計（本文件）           | `Tutorial.md`                                |
| 一個完整的小範例                   | `docs/guides/example-measurement.md`         |
| AI Agent 要遵守的規則              | `AGENTS.md`                                  |

---

## 1. 先理解這個系統

醉後比較 由以下部分組成：

```text
前端網頁（本專案）  ⇄  靜態資料（酒款表、容器表、運動表，放在 mock/）
        ⇅
瀏覽器 localStorage（身高體重、運動開關、進行中的一輪與前一輪紀錄）
```

本專案沒有後端。最重要的一條界線是：**熱量與運動代償只能由靜態資料表加上 `calc.ts` 算出來，元件只負責顯示與收集輸入。**

舉例來說，一杯中杯啤酒的熱量，是「酒款表的每 100 ml 熱量 × 容器表的容量 × 杯數」算出來的。如果在元件裡順手寫一個 `150`，畫面看起來沒問題，但學生修改酒款表後，這個數字永遠不會變，而且沒有人會發現它和資料不一致。醉後底線的成功或失敗判定也一樣：它必須來自同一套計算，不能由不同畫面各自算一次。

所以在前端寫程式時，要一直問自己：

- 我顯示的數字，是**由靜態資料與 `calc.ts` 算出來的**，還是**我自己寫死或推測的**？
- 寫進 localStorage 之後，重新整理還能完整還原嗎？「畫面上看得到」不代表「已經保存」，要實際重新整理確認。
- 資料讀不到（靜態資料讀取失敗、localStorage 內容損毀）時，應該顯示錯誤或回到初始狀態，而不是顯示 0 或假裝一切正常。

這些原則會反覆出現在驗收標準中。

---

## 2. 為什麼要分層

### 2.1 資料流

```text
元件 Component
  ↓ 只呼叫 hooks
hooks.ts（SWR）        決定「何時取、取完怎麼判斷」
  ↓
api.ts（axios）        決定「怎麼發請求」
  ↓
lib/http.ts / mock/    實際送出請求，或回傳模擬資料
```

另外一條獨立的線：元件 ⇄ `store.ts`（zustand），只處理前端自己的狀態。

### 2.2 每一層只有一個「改變的理由」

分層的目的，是讓每一種變動只需要修改一個地方：

| 發生的變化                     | 需要修改的地方      | 不需要動的地方         |
| ------------------------------ | ------------------- | ---------------------- |
| 後端調整了欄位名稱             | `schema.ts`、`api.ts` | hooks、元件            |
| 新增一款酒                     | `mock/` 的酒款表    | 其他全部               |
| 日後從靜態資料換成真實後端     | `config/`（環境變數） | 其他全部               |
| 運動換算公式改變               | `domain/exercise/calc.ts` | api、hooks、元件  |
| 畫面排版改變                   | 元件                | api、hooks             |
| 身高體重的有效範圍改變         | `config/`           | 其他全部               |

如果你發現一個小改動需要同時修改五、六個檔案，通常代表某一層做了不屬於它的事。

### 2.3 為什麼依資源分目錄

`domain/` 下是依資源（`drink`、`container`、`exercise`、`drink-session`、`settings`）分目錄，而不是把所有 api 放一起、所有 hooks 放一起。

因為開發時你一次只會處理一個功能。做 FE-08 醉後底線時，你需要的型別、請求、hooks 大多在 `domain/drink-session/` 裡，不必在整個專案中來回跳轉，也比較不會不小心改到其他功能。

### 2.4 為什麼全部用 Client Component

Next.js 支援 Server Component，但本專案刻意只用 Client Component：

- 使用者資料與飲酒紀錄保存在 localStorage，而 localStorage 只存在於瀏覽器中，伺服器端讀不到。
- 靜態資料目前打包在前端，日後若改由後端提供，前端只透過 Base URL 呼叫，就不必預先綁定實作方式。
- 只有一種渲染模式，學習時可以專注在資料流本身，不必同時處理伺服器與用戶端的邊界問題。

唯一的例外是 `app/layout.tsx`：它只放 `metadata`、字型與全域 Provider，維持為 Server Component。

另外，本專案部署到 GitHub Pages，只能提供靜態檔案，沒有伺服器可以在使用者瀏覽時執行程式。所以 `next.config.ts` 設定為靜態輸出（`output: 'export'`），動態路由、Server Actions、Route Handlers 這類需要伺服器的功能都不能用。有些用法不會讓建置失敗，只是被悄悄排除在輸出之外，所以每次 `npm run build` 後，記得確認 Route 清單全部都是 `○ (Static)`。詳細清單見 `frontend-architecture.md` §3.2。

---

## 3. 關鍵套件怎麼用

### 3.1 先分清楚兩種狀態

這是理解 SWR 與 zustand 分工的關鍵：

| 類型       | 例子                             | 誰擁有它     | 用什麼管理 |
| ---------- | -------------------------------- | ------------ | ---------- |
| 伺服器狀態 | 酒款表、容器表、運動表           | 靜態資料（日後可能是後端） | SWR        |
| 用戶端狀態 | 身高體重、運動開關、進行中的一輪 | 前端自己     | zustand（`persist` 保存到 localStorage） |

伺服器狀態的「真相」在資料來源（本專案是靜態資料），前端拿到的永遠只是某個時間點的副本。所以它需要快取、重新取得、錯誤處理，這正是 SWR 擅長的事。

用戶端狀態的真相就在前端，不會過期，也不需要重新取得，用簡單的 store 保存即可。本專案沒有後端，所以飲酒紀錄也屬於用戶端狀態，並用 `persist` 保存到 localStorage。

**最常見的錯誤**是把 SWR 拿到的資料再存一份到 zustand。這樣會出現兩份可能不一致的資料，之後很難追查哪一份才是對的。

### 3.2 axios：定義請求

`api.ts` 中每個 API 契約對應一個函式，只做一件事：送出請求，回傳型別明確的資料。

```ts
export async function getContainers(): Promise<Container[]> {
  if (apiConfig.useMock) {
    await sleep(500)
    return mockContainers
  }

  const response = await http.get<Container[]>('/api/v1/containers')
  return response.data
}
```

注意幾點：

- 使用 `lib/http.ts` 的共用 instance，Base URL 與逾時時間只需要設定一次。
- 這裡不寫 React、不判斷資料是否過期、不處理畫面狀態。它應該能在任何地方被呼叫。
- Mock 與真實請求的切換只發生在這一層，所以上層完全不知道資料來自哪裡。

### 3.3 SWR：控制資源取用

hooks 是商業邏輯的所在：何時取得、失敗時如何判斷、操作後要重新取得哪些資料。本專案的靜態資料不會變動，所以不需要輪詢。

```ts
export function useContainers() {
  const { data, error, isLoading } = useSWR(containerKeys.list, getContainers)

  return { containers: data, isLoading, error }
}
```

幾個值得理解的 SWR 行為：

- **key** 是快取的識別。不同元件使用相同 key，會共用同一份資料與同一次請求。
- **請求失敗時，`data` 會保留上一次成功的結果**，同時 `error` 有值。第一次就失敗時 `data` 是 `undefined`，畫面要顯示錯誤狀態，而不是把容器清單當成空的。
- 本專案目前沒有寫入型 API，飲酒紀錄是寫進 zustand store。日後若新增寫入型 API，完成後要用 `mutate` 重新取得相關資源，讓畫面顯示資料來源回報的狀態，而不是自己假設的結果。

元件只透過 hooks 取得資料，不直接呼叫 `api.ts`。這樣快取與錯誤判斷才會集中在一個地方。

### 3.4 zustand：通用狀態

store 只定義狀態；修改狀態的函式定義在 store 之外：

```ts
export const useSettingsStore = create<SettingsState>()(
  persist(() => ({ weightKg: null, heightCm: null }), { name: storageConfig.settingsKey }),
)

export function setBodyProfile(heightCm: number, weightKg: number) {
  useSettingsStore.setState({ heightCm, weightKg })
}
```

為什麼這樣寫：

- `setBodyProfile` 是一般函式，不受 hook 規則限制，可以在事件處理、SWR callback 等任何地方呼叫。
- 元件只需要訂閱真正會用到的狀態，不必為了取得修改函式而訂閱 store。

讀取時使用 selector，只取出需要的欄位：

```ts
const weightKg = useSettingsStore((state) => state.weightKg)
```

`persist` 會自動把狀態寫進 localStorage，重新整理後再讀回來。所以 store 的形狀改變時，要記得調整 `persist` 的 `version`，否則舊資料可能讀出錯誤的格式。

如果寫成 `useSettingsStore()` 取出整個 store，store 中任何欄位改變都會讓元件重新渲染。

### 3.5 Material UI

- 優先使用 MUI 既有元件（`Card`、`Stack`、`TextField`、`Alert`⋯⋯），樣式透過 `sx` 調整，不另外寫 CSS 檔。
- 全域主題在 `styles/theme.ts`。需要調整顏色或字型時改這裡，不要在各元件中寫死。
- 不要另外引入圖表套件；需要時先與講師確認。

### 3.6 Next.js 版本注意

本專案使用的 Next.js 版本較新，部分 API 與你（或 AI Agent）過去熟悉的寫法不同。不確定時，以 `node_modules/next/dist/docs/` 中的文件為準，而不是網路上的舊文章。

---

## 4. 契約、Mock 與設定

### 4.1 先有契約，才有程式碼

開發一個功能的順序是：

1. 在 `api-contracts.md` 中確認或提出（`Proposed`）該 API 的格式。
2. 依契約寫 `schema.ts` 的型別。
3. 依型別寫 Mock 資料。
4. 寫 `api.ts`、`hooks.ts`、元件。

順序不能反過來。如果先寫程式再補文件，程式碼就會變成「事實上的契約」，後端接手時只能猜你的意圖。

### 4.2 Mock 的定位

本專案沒有後端，酒款表、容器表與運動表就是 `mock/` 中的靜態資料，Mock 開關恆開。Mock 刻意保持簡單：

- 資料必須宣告型別，讓型別檢查幫你發現與契約不符的地方。
- 需要新增酒款、容器或運動時，直接修改 `mock/` 中的資料；畫面上不提供新增功能。
- 要驗證失敗、空資料等情境時，手動修改 Mock 資料或暫時加上 `throw` 來重現。

畫面上的「靜態資料模式」標示不能拿掉。Mock 能讓畫面動起來，但不代表後端已經實作，也不代表契約已經確認。

### 4.3 為什麼數值要放在 `config/`

規格中有很多數值尚未決定，例如醉後底線的低血量門檻（暫定 20%）、杯數的有效範圍。集中在 `config/` 並標示「規格明定」或「暫定」，有兩個好處：

- 決定改變時只需要改一個地方。
- 讀程式碼的人知道哪些值是可以討論的，不會把暫定值誤當成規格。

---

## 5. 與 AI Agent 協作

AI Agent 會讀 `AGENTS.md` 並遵守其中的規則，但它不知道你理解到哪裡。協作時請注意：

**一次只給一個目標。** 「完成 FE-08 醉後底線」太大了；「依 API-02 的契約建立 `domain/container/schema.ts`」剛好。範圍越小，越容易檢查結果是否正確。

**先讀懂再繼續。** 每一步完成後，確認自己說得出這個檔案做什麼、依賴誰、為什麼放在這裡。說不出來就請 Agent 解釋，而不是直接進行下一步。

**留意超出範圍的內容。** Agent 常會順手多做一些事，例如新增套件、建立共用元件、修改其他功能的檔案。如果不是這一步需要的，請它移除。

**不要接受「已完成」的宣告。** 程式碼生成了、建置成功了，都不代表功能正確。依 `development-plan.md` §3.5 自己驗證每一條驗收標準。

**規格不清楚時，先問而不是猜。** 遇到規格沒寫的行為，請 Agent 列出問題並記錄在文件中，不要讓它自己決定業務規則。

---

## 6. 常見陷阱

| 陷阱                                     | 為什麼是問題                       | 正確做法                           |
| ---------------------------------------- | ---------------------------------- | ---------------------------------- |
| 在元件中直接呼叫 axios 或 `fetch`        | 輪詢、快取、錯誤處理散落各處       | 一律透過 hooks                     |
| 把 API 資料存進 zustand                  | 兩份資料可能不一致                 | 伺服器資料只放在 SWR               |
| 請求成功就把畫面顯示為已完成             | 後端或外部系統可能還沒執行或失敗   | 重新取得後端回報的狀態             |
| 資料抓不到時顯示 0                       | 使用者會誤以為真的是 0             | 保留舊資料並標示過期               |
| 用前端計時器執行需要可靠執行的判斷       | 網頁關閉時判斷就失效               | 只顯示後端或外部系統的判斷結果     |
| 在元件中寫死規格數值                     | 規格改變時要到處找                 | 放在 `config/` 並標示來源          |
| 先寫程式，之後再補契約                   | 程式碼變成沒有人確認過的契約       | 先在 `api-contracts.md` 提出       |
| 為了「看起來完整」建立空檔案或預留抽象   | 增加閱讀負擔，之後常常用不到       | 需要時再建立                       |
| 在元件中計算熱量或運動時間               | 不同畫面算出不同結果，也無法單獨驗證 | 計算集中在 `calc.ts`，元件只顯示 |
| 只在畫面上測試，沒有重新整理             | 進行中的一輪可能沒有真的保存       | 每次驗證都重新整理一次，確認可以還原 |

---

## 7. 每次完成一個任務

1. `npm run typecheck`、`npm run lint`、`npm run build` 全部通過。
2. `npm run dev` 啟動，逐條對照驗收標準實際操作。
3. 在 `development-plan.md` 記錄驗證結果；契約有變動就同步更新 `api-contracts.md`。
4. 確認自己能說明這次修改的資料流與關鍵決策。
