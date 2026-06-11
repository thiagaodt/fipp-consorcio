'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, isAuthenticated } from '@/lib/api'
import Badge from '@/components/Badge'
import {
  Wallet, ArrowDownToLine, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react'

export default function SaldoPage() {
  const router = useRouter()
  const [saldo, setSaldo] = useState(null)
  const [movimentos, setMovimentos] = useState([])
  const [valor, setValor] = useState('')
  const [loading, setLoading] = useState(true)
  const [saqueLoading, setSaqueLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    load()
  }, [])

  async function load() {
    try {
      const [s, m] = await Promise.allSettled([
        api.get('/saldo/administrador'),
        api.get('/saldo/administrador/movimentacoes'),
      ])
      if (s.status === 'fulfilled') setSaldo(s.value)
      if (m.status === 'fulfilled') setMovimentos(m.value)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaque(e) {
    e.preventDefault()
    setMsg(''); setErro('')
    setSaqueLoading(true)
    try {
      const res = await api.post('/saldo/administrador/saque', { valor: Number(valor) })
      setMsg(`Saque de R$ ${Number(res.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado com sucesso!`)
      setValor('')
      load()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSaqueLoading(false)
    }
  }

  const totalCreditos = movimentos.filter(m => m.tipo === 'CREDITO').reduce((acc, m) => acc + Number(m.valor), 0)
  const totalSaques = movimentos.filter(m => m.tipo === 'SAQUE').reduce((acc, m) => acc + Number(m.valor), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Saldo de Administrador</h1>
        <p className="text-sm text-gray-500 mt-1">Acompanhe seus rendimentos como administrador de consórcios.</p>
      </div>

      {/* Balance + stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card sm:col-span-1 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shrink-0">
            <Wallet size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Saldo disponível</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {Number(saldo?.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <TrendingUp size={20} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total recebido</p>
            <p className="text-lg font-bold text-gray-900">
              R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <TrendingDown size={20} className="text-red-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total sacado</p>
            <p className="text-lg font-bold text-gray-900">
              R$ {totalSaques.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Saque form */}
      <div className="card">
        <h2 className="section-title mb-4">Realizar Saque</h2>
        <form onSubmit={handleSaque} className="flex items-end gap-3 max-w-sm">
          <div className="flex-1">
            <label className="label">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">R$</span>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="0,00"
                required
                className="input pl-10"
              />
            </div>
          </div>
          <button type="submit" disabled={saqueLoading} className="btn-primary shrink-0">
            {saqueLoading
              ? <><Loader2 size={16} className="animate-spin" /> Processando...</>
              : <><ArrowDownToLine size={16} /> Sacar</>
            }
          </button>
        </form>

        {msg && (
          <div className="flex items-center gap-2 mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 size={15} className="shrink-0" /> {msg}
          </div>
        )}
        {erro && (
          <div className="flex items-center gap-2 mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            <AlertCircle size={15} className="shrink-0" /> {erro}
          </div>
        )}
      </div>

      {/* Movimentações */}
      <div>
        <h2 className="section-title mb-4">Movimentações</h2>

        {movimentos.length === 0 ? (
          <div className="card py-12 text-center">
            <Wallet size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhuma movimentação registrada.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="th">Data</th>
                  <th className="th">Tipo</th>
                  <th className="th">Consórcio</th>
                  <th className="th text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {movimentos.map((m) => (
                  <tr key={m.id} className="tr-hover">
                    <td className="td text-gray-500">{m.data?.slice(0, 10)}</td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        {m.tipo === 'CREDITO'
                          ? <TrendingUp size={14} className="text-emerald-600" />
                          : <TrendingDown size={14} className="text-red-500" />
                        }
                        <Badge status={m.tipo} />
                      </div>
                    </td>
                    <td className="td text-gray-600">{m.con_nome ?? '—'}</td>
                    <td className={`td text-right font-semibold ${m.tipo === 'CREDITO' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.tipo === 'CREDITO' ? '+' : '-'} R$ {Number(m.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
