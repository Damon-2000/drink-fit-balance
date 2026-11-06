import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { ThemeProvider } from '@mui/material'
import theme from '@/styles/theme'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '醉後比較',
  description: '把每一杯酒的熱量換算成運動代償或今日熱量血量的飲酒紀錄工具',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='zh-Hant-TW' className={roboto.className}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
