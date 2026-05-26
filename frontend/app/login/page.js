'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, saveAuth } from '@/lib/api'
import { Building2, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const data = await api.post('/auth/login', form)
      saveAuth(data.token, data.usuario)
      router.push('/dashboard')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">FIPP</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Gestão de<br />
            <span className="text-indigo-400">Consórcios</span><br />
            simplificada.
          </h1>
          <p className="mt-4 text-slate-400 text-lg leading-relaxed max-w-sm">
            Gerencie assembleias, cotas, pagamentos e sorteios em um único lugar.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: 'Assembleias automatizadas', desc: 'Sorteios com auditoria' },
              { label: 'Pagamento via PIX', desc: 'Integração AbacatePay' },
              { label: 'Controle de saldo', desc: 'Administrador e consórcio' },
              { label: 'Gestão de cotas', desc: 'Status em tempo real' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-slate-800/60 p-4 ring-1 ring-slate-700">
                <p className="text-sm font-semibold text-slate-200">{f.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">© 2025 FIPP Consórcio. Todos os direitos reservados.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                <Building2 size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">FIPP</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Acesse sua conta</h2>
            <p className="mt-1 text-sm text-gray-500">Bem-vindo de volta.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                <AlertCircle size={15} className="shrink-0" />
                {erro}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? 'Entrando...' : (
                <>Entrar <ArrowRight size={17} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
