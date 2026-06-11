'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, saveAuth } from '@/lib/api'
import { Building2, Mail, Lock, ArrowRight, AlertCircle, User, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const expired = searchParams.get('expired')

  const [modo, setModo] = useState('login')
  const [login, setLogin] = useState({ email: '', senha: '' })
  const [cadastro, setCadastro] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLoginChange(e) {
    setLogin((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleCadastroChange(e) {
    setCadastro((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function trocarModo(novoModo) {
    setModo(novoModo)
    setErro('')
    setSucesso('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const data = await api.post('/auth/login', login)
      saveAuth(data.token, data.usuario)
      router.push('/dashboard')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCadastro(e) {
    e.preventDefault()
    setErro('')
    if (cadastro.senha !== cadastro.confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    setLoading(true)
    try {
      await api.post('/usuario', {
        nome: cadastro.nome,
        email: cadastro.email,
        senha: cadastro.senha,
      })
      setSucesso('Conta criada com sucesso! Faça login para continuar.')
      setCadastro({ nome: '', email: '', senha: '', confirmarSenha: '' })
      setModo('login')
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

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">FIPP</span>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-200 p-1 mb-8">
            <button
              onClick={() => trocarModo('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                modo === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => trocarModo('cadastro')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                modo === 'cadastro'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {expired && modo === 'login' && !sucesso && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200 mb-5">
              <AlertCircle size={15} className="shrink-0" />
              Sua sessão expirou. Faça login novamente.
            </div>
          )}

          {sucesso && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200 mb-5">
              <CheckCircle2 size={15} className="shrink-0" />
              {sucesso}
            </div>
          )}

          {modo === 'login' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Acesse sua conta</h2>
                <p className="mt-1 text-sm text-gray-500">Bem-vindo de volta.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="label">E-mail</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={login.email}
                      onChange={handleLoginChange}
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
                      value={login.senha}
                      onChange={handleLoginChange}
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
                  {loading ? 'Entrando...' : <> Entrar <ArrowRight size={17} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Crie sua conta</h2>
                <p className="mt-1 text-sm text-gray-500">Preencha os dados abaixo para começar.</p>
              </div>

              <form onSubmit={handleCadastro} className="space-y-5">
                <div>
                  <label className="label">Nome</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="nome"
                      value={cadastro.nome}
                      onChange={handleCadastroChange}
                      placeholder="Seu nome completo"
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">E-mail</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={cadastro.email}
                      onChange={handleCadastroChange}
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
                      value={cadastro.senha}
                      onChange={handleCadastroChange}
                      placeholder="Mínimo 4 caracteres"
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Confirmar senha</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="confirmarSenha"
                      value={cadastro.confirmarSenha}
                      onChange={handleCadastroChange}
                      placeholder="Repita a senha"
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
                  {loading ? 'Cadastrando...' : <> Criar conta <ArrowRight size={17} /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
