import type { NextConfig } from 'next'

// 部署到 GitHub Pages：只輸出靜態檔案（out/），執行時沒有 Node.js 伺服器
// output: 'export' 會讓大多數需要伺服器的功能在 dev 與 build 時直接報錯，例如 Server Actions、
// 沒有 generateStaticParams 的動態路由、cookies、redirects、rewrites、headers
// 只處理 POST 的 Route Handler 仍能建置成功但不會被輸出，所以建置後要確認所有路由都是 ○ (Static)
// 不啟用 cacheComponents：它需要 Node.js 執行環境，而且本專案的資料都在瀏覽器端取得
const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages 的專案網址為 https://<帳號>.github.io/<repo>/，部署時由環境變數提供 /<repo>
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  // 每個頁面輸出成 <路徑>/index.html，GitHub Pages 才能直接以目錄網址提供
  trailingSlash: true,
  // 預設的圖片最佳化需要伺服器
  images: { unoptimized: true },
  reactCompiler: true,
}

export default nextConfig
