import './globals.css'
import AppLayout from '@/components/AppLayout'

export const metadata = { title: 'FIPP Consórcio' }

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
