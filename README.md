# 醉後比較

醉後比較是一個以「熱量控制」為目的的飲酒紀錄工具。使用者逐杯登記飲酒內容，系統把酒的熱量換算成運動代償（醉後回本），或以「血量」呈現與今日熱量目標的差距（醉後底線）。本專案為學生個人練習與自用。

```text
前端網頁（本專案）  ⇄  靜態資料（酒款表、容器表、運動表）
        ⇅
瀏覽器 localStorage（身高體重、運動開關、飲酒紀錄）
```

本專案沒有後端：酒款表、容器表與運動表以 `mock/` 中的靜態資料提供（Mock 模式恆開），畫面上會標示「靜態資料模式」；使用者資料與飲酒紀錄只保存在瀏覽器的 localStorage。

## 技術棧

- Next.js（App Router）、React、TypeScript
- Material UI
- axios、SWR、zustand

## 環境需求

- Node.js 20.9 以上
- npm

## 安裝與啟動

```bash
npm install
cp .env.example .env.local   # 可選，未建立時使用預設值
npm run dev
```

開啟 <http://localhost:3000>。

## 環境變數

| 變數                       | 預設值   | 說明                                         |
| -------------------------- | -------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | 空字串   | 後端 API 位址；空字串代表與前端同源          |
| `NEXT_PUBLIC_USE_MOCK`     | `true`   | 設為 `false` 時改為呼叫真實 API              |
| `NEXT_PUBLIC_BASE_PATH`    | 空字串   | 部署到 GitHub Pages 時設為 `/<repo>`；本機開發保持空白 |

修改環境變數後需重新啟動開發伺服器。

## 指令

| 指令                | 用途                 |
| ------------------- | -------------------- |
| `npm run dev`       | 啟動開發伺服器       |
| `npm run build`     | 正式建置（靜態輸出到 `out/`） |
| `npm run typecheck` | 型別檢查             |
| `npm run lint`      | Lint 檢查            |

## 目錄結構

```text
app/        路由與頁面
components/ 跨功能共用的 UI 元件（FE-01 建立）
config/     環境設定與規格數值
domain/     依資源分類的型別、API、hooks 與 store
lib/        共用工具（axios instance）
mock/       靜態資料（酒款表、容器表、運動表）
styles/     MUI theme
docs/       規格、開發計畫與架構文件
```

## 文件

- [Tutorial.md](Tutorial.md)：專案架構與開發指南，開始開發前請先閱讀。
- [docs/spec/product-spec.md](docs/spec/product-spec.md)：功能規格。
- [docs/spec/development-plan.md](docs/spec/development-plan.md)：開發計畫與進度。
- [docs/architecture/api-contracts.md](docs/architecture/api-contracts.md)：API 契約。
- [docs/architecture/frontend-architecture.md](docs/architecture/frontend-architecture.md)：前端架構規則。
- [docs/wireframe/](docs/wireframe/)：學生提交的線稿與操作流程圖。

## 部署

本專案部署到 GitHub Pages，`next.config.ts` 設定為靜態輸出（`output: 'export'`），不能使用需要伺服器的 Next.js 功能，詳見 `docs/architecture/frontend-architecture.md` §3.2。

本機預覽正式建置結果：

```bash
npm run build
npx serve out
```

GitHub Actions 部署流程屬於 development-plan FE-11，尚未建立。
