'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, getUser, saveAuth, isAuthenticated } from '@/lib/api'
import { User, Mail, Lock, CheckCircle2, AlertCircle, Save } from 'lucide-react'

export default function PerfilPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' })
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    const user = getUser()
    if (user) {
      setForm((f) => ({ ...f, nome: user.nome ?? '', email: user.email ?? '' }))
    }
  }, [])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setSucesso('')
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (form.senha && form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    const user = getUser()
    if (!user?.id) {
      setErro('Sessão inválida. Faça login novamente.')
      return
    }

    setLoading(true)
    try {
      const body = { nome: form.nome, email: form.email }
      if (form.senha) body.senha = form.senha

      const data = await api.put(`/usuario/${user.id}`, body)

      // Atualiza o usuário no localStorage com os novos dados
      const token = localStorage.getItem('token')
      saveAuth(token, { ...user, nome: form.nome, email: form.email })

      setForm((f) => ({ ...f, senha: '', confirmarSenha: '' }))
      setSucesso('Perfil atualizado com sucesso!')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="page-title">Meu Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Atualize seus dados pessoais.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nome</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
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
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="input pl-10"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
              Alterar senha — deixe em branco para manter a atual
            </p>

            <div className="space-y-4">
              <div>
                <label className="label">Nova senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="senha"
                    value={form.senha}
                    onChange={handleChange}
                    placeholder="Mínimo 4 caracteres"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Confirmar nova senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmarSenha"
                    value={form.confirmarSenha}
                    onChange={handleChange}
                    placeholder="Repita a nova senha"
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {sucesso && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 size={15} className="shrink-0" />
              {sucesso}
            </div>
          )}

          {erro && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              <AlertCircle size={15} className="shrink-0" />
              {erro}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? 'Salvando...' : <><Save size={16} /> Salvar alterações</>}
          </button>
        </form>
      </div>
    </div>
  )
}
