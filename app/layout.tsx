import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { course } from '@/data/course'
import { AnnouncementBanner } from '@/components/announcement-banner'
import { SiteNavbar } from '@/components/site-navbar'
import { SiteFooter } from '@/components/site-footer'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Clancy — UNSW's brand headline typeface. Self-hosted from public/brand/fonts.
const clancy = localFont({
  src: [
    { path: '../public/brand/fonts/Clancy-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/brand/fonts/Clancy-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-clancy',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'COMP3110: Machine Learning Engineering',
    template: '%s · COMP3110',
  },
  description:
    'UNSW COMP3110: Machine Learning Engineering: an accelerator-style course for applying machine learning to solve real problems.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${clancy.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <AnnouncementBanner announcement={course.announcement} />
        <SiteNavbar />
        <main className="grow w-full">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
