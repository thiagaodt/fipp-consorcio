import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = { title: 'FIPP Consórcio' }

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
