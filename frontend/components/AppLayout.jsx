'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  if (isLogin) return <>{children}</>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <main className="min-h-screen p-8">{children}</main>
      </div>
    </div>
  )
}
