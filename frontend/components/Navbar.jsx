'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { clearAuth, getUser, api } from '@/lib/api'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const user = getUser()

  if (pathname === '/login') return null

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } catch {}
    clearAuth()
    router.push('/login')
  }

  return (
    <nav>
      <Link href="/dashboard">Início</Link>
      <Link href="/consorcios">Consórcios</Link>
      <Link href="/cotas">Minhas Cotas</Link>
      <Link href="/saldo">Saldo</Link>
      <span>{user?.nome}</span>
      <button onClick={handleLogout}>Sair</button>
    </nav>
  )
}
