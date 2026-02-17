import type { Metadata } from 'next'
import './globals.css'
import { LocaleProvider } from '@/components/LocaleProvider'

export const metadata: Metadata = {
  title: 'AdaStock - Inventory Management',
  description: 'Simple inventory and stock management for restaurants',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%2322c55e' rx='40'/%3E%3Ctext x='100' y='120' text-anchor='middle' font-family='Arial, sans-serif' font-size='80' font-weight='bold' fill='white'%3E📦%3C/text%3E%3C/svg%3E"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#22c55e" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AdaStock" />
      </head>
      <body className="antialiased">
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}