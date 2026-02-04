import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SettingsProvider } from '@/context/SettingsContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AI 投資分析儀 V10.0',
  description: 'AI Quantitative Investment Analyzer',
}

import { AlertToastContainer } from '@/components/Market/AlertToastContainer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className={inter.variable}>
      <body className="antialiased bg-black overflow-x-hidden selection:bg-cyan-500/30">
        <SettingsProvider>
          {children}
          <AlertToastContainer />
        </SettingsProvider>
      </body>
    </html>
  )
}
