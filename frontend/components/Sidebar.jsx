'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { clearAuth, getUser, api } from '@/lib/api'
import {
  LayoutDashboard,
  Building2,
  Ticket,
  Wallet,
  LogOut,
  ChevronRight,
  UserCircle,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/consorcios', label: 'Consórcios', icon: Building2 },
  { href: '/cotas', label: 'Minhas Cotas', icon: Ticket },
  { href: '/saldo', label: 'Saldo', icon: Wallet },
  { href: '/perfil', label: 'Meu Perfil', icon: UserCircle },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const user = getUser()

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    clearAuth()
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-lg">
          <Building2 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">FIPP</p>
          <p className="text-xs text-slate-400 leading-none">Consórcios</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={17} className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-indigo-300" />}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-700/60 px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 ring-1 ring-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-300">
              {user?.nome?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">{user?.nome}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </aside>
  )
}
