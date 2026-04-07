import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Vegas — Documentos', description: 'Sistema de gestão de documentos Vegas' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

