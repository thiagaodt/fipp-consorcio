'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getUser, isAuthenticated } from '@/lib/api'
import {
  Users, ShieldCheck, UserCircle, UserX, UserCheck,
  AlertCircle, CheckCircle2, Loader2, Plus, Pencil, X, Save,
} from 'lucide-react'

function PerfilBadge({ perfil }) {
  return perfil === 'ADMINISTRADOR'
    ? <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700"><ShieldCheck size={11} /> Administrador</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600"><UserCircle size={11} /> Padrão</span>
}

function AtivoBadge({ ativo }) {
  return ativo === 'S'
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"><UserCheck size={11} /> Ativo</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600"><UserX size={11} /> Inativo</span>
}

const FORM_VAZIO = { nome: '', email: '', senha: '', perfil: 'PADRAO' }

export default function UsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  // modal de cadastro/edição
  const [modal, setModal] = useState(null)   // null | 'novo' | { usuario }
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)

  const eu = getUser()

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    if (eu?.perfil !== 'ADMINISTRADOR') { router.push('/dashboard'); return }
    load()
  }, [])

  async function load() {
    try {
      const data = await api.get('/usuario/todos')
      setUsuarios(data)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  function abrirNovo() {
    setForm(FORM_VAZIO)
    setModal('novo')
    setMsg(''); setErro('')
  }

  function abrirEditar(u) {
    setForm({ nome: u.nome, email: u.email, senha: '', perfil: u.perfil ?? 'PADRAO' })
    setModal(u)
    setMsg(''); setErro('')
  }

  function fecharModal() {
    setModal(null)
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      if (modal === 'novo') {
        await api.post('/usuario', { nome: form.nome, email: form.email, senha: form.senha, perfil: form.perfil })
        setMsg(`Usuário ${form.nome} cadastrado com sucesso.`)
      } else {
        const body = { nome: form.nome, email: form.email, perfil: form.perfil }
        if (form.senha) body.senha = form.senha
        await api.put(`/usuario/${modal.id}`, body)
        setMsg(`Usuário ${form.nome} atualizado com sucesso.`)
      }
      fecharModal()
      load()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  async function toggleAtivo(u) {
    setMsg(''); setErro('')
    setTogglingId(u.id)
    try {
      const res = await api.patch(`/usuario/${u.id}/ativo`)
      setUsuarios(prev => prev.map(x =>
        x.id === u.id ? { ...x, ativo: res.ativo } : x
      ))
      setMsg(`Usuário ${u.nome} ${res.ativo === 'S' ? 'reativado' : 'desativado'}.`)
    } catch (err) {
      setErro(err.message)
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Controle de Usuários</h1>
          <p className="text-sm text-gray-500 mt-1">{usuarios.length} usuário(s) cadastrado(s).</p>
        </div>
        <button onClick={abrirNovo} className="btn-primary">
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 size={15} className="shrink-0" /> {msg}
        </div>
      )}
      {erro && !modal && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <AlertCircle size={15} className="shrink-0" /> {erro}
        </div>
      )}

      {usuarios.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Users size={32} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="th">#</th>
                <th className="th">Nome</th>
                <th className="th">E-mail</th>
                <th className="th">Perfil</th>
                <th className="th">Status</th>
                <th className="th text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {usuarios.map((u) => {
                const souEu = u.id === eu?.id
                const inativo = u.ativo === 'N'
                return (
                  <tr key={u.id} className={`tr-hover ${inativo ? 'opacity-50' : ''}`}>
                    <td className="td text-gray-400">{u.id}</td>
                    <td className="td font-medium text-gray-900">
                      {u.nome}
                      {souEu && <span className="ml-2 text-xs text-gray-400">(você)</span>}
                    </td>
                    <td className="td text-gray-500">{u.email}</td>
                    <td className="td"><PerfilBadge perfil={u.perfil} /></td>
                    <td className="td"><AtivoBadge ativo={u.ativo} /></td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                        >
                          <Pencil size={12} /> Editar
                        </button>

                        <button
                          onClick={() => toggleAtivo(u)}
                          disabled={!!togglingId || souEu}
                          title={souEu ? 'Não é possível alterar seu próprio status' : ''}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            inativo
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {togglingId === u.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : inativo ? <UserCheck size={12} /> : <UserX size={12} />
                          }
                          {inativo ? 'Reativar' : 'Desativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cadastro / edição */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                {modal === 'novo' ? 'Novo Usuário' : `Editar — ${modal.nome}`}
              </h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 px-6 py-5">
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label">
                  Senha {modal !== 'novo' && <span className="text-gray-400 font-normal">(deixe em branco para manter)</span>}
                </label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  required={modal === 'novo'}
                  placeholder={modal === 'novo' ? 'Mínimo 4 caracteres' : '••••••••'}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Perfil</label>
                <select
                  value={form.perfil}
                  onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}
                  className="input"
                >
                  <option value="PADRAO">Padrão</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>

              {erro && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                  <AlertCircle size={15} className="shrink-0" /> {erro}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={fecharModal} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="btn-primary">
                  {salvando ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : <><Save size={15} /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
