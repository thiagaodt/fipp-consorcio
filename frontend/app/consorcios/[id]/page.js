'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getUser } from '@/lib/api'
import Badge from '@/components/Badge'
import {
  ChevronLeft, Pencil, Trash2, Users, CalendarDays,
  Wallet, Trophy, AlertCircle, CheckCircle2, Loader2,
  Dice5, TrendingUp, TrendingDown, Ticket
} from 'lucide-react'

const TABS = ['Informações', 'Cotas', 'Assembleias', 'Saldo']

function MetricCard({ label, value, sub }) {
  return (
    <div className="card">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function ConsorcioDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const user = getUser()

  const [tab, setTab] = useState('Informações')
  const [consorcio, setConsorcio] = useState(null)
  const [cotas, setCotas] = useState([])
  const [assembleias, setAssembleias] = useState([])
  const [corrente, setCorrente] = useState(null)
  const [saldo, setSaldo] = useState(null)
  const [movimentos, setMovimentos] = useState([])
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sorteioLoading, setSorteioLoading] = useState(false)
  const [quantidadeCotas, setQuantidadeCotas] = useState(1)
  const [comprando, setComprando] = useState(false)

  const isAdmin = consorcio && user && consorcio.usu_id === user.id

  useEffect(() => {
    async function load() {
      try {
        const c = await api.get(`/consorcio/${id}`)
        setConsorcio(c)
      } catch (e) {
        setErro(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (tab === 'Cotas') loadCotas()
    if (tab === 'Assembleias') loadAssembleias()
    if (tab === 'Saldo') loadSaldo()
  }, [tab])

  async function loadCotas() {
    try { setCotas(await api.get(`/cota/consorcio/${id}`)) } catch {}
  }
  async function loadAssembleias() {
    const [asm, cor] = await Promise.allSettled([
      api.get(`/assembleia/consorcio/${id}`),
      api.get(`/assembleia/consorcio/${id}/corrente`),
    ])
    if (asm.status === 'fulfilled') setAssembleias(asm.value)
    if (cor.status === 'fulfilled') setCorrente(cor.value)
  }
  async function loadSaldo() {
    const [s, m] = await Promise.allSettled([
      api.get(`/saldo/consorcio/${id}`),
      api.get(`/saldo/consorcio/${id}/movimentacoes`),
    ])
    if (s.status === 'fulfilled') setSaldo(s.value)
    if (m.status === 'fulfilled') setMovimentos(m.value)
  }

  async function handleComprarCotas(e) {
    e.preventDefault()
    setErro(''); setMsg('')
    setComprando(true)
    let sucessoCount = 0;
    try {
      for (let i = 0; i < quantidadeCotas; i++) {
        await api.post('/cota', { con_id: Number(id), usu_id: Number(user.id) })
        sucessoCount++;
      }
      setMsg(`${sucessoCount} cota(s) adquirida(s) com sucesso.`)
      setQuantidadeCotas(1)
      loadCotas()
    } catch (err) {
      if (sucessoCount > 0) {
        setErro(`Erro após adquirir ${sucessoCount} cotas: ${err.message}`)
        loadCotas()
      } else {
        setErro(err.message)
      }
    } finally {
      setComprando(false)
    }
  }

  async function handleSorteio(ass_id) {
    setSorteioLoading(true); setErro(''); setMsg('')
    try {
      const res = await api.post(`/assembleia/${ass_id}/realizar`)
      setMsg(`Sorteio realizado! Cota contemplada: nº ${res.cot_numero}`)
      loadAssembleias()
    } catch (err) { setErro(err.message) }
    finally { setSorteioLoading(false) }
  }

  async function handleDelete() {
    if (!confirm(`Excluir o consórcio "${consorcio.con_nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await api.delete(`/consorcio/${id}`)
      router.push('/consorcios')
    } catch (err) { setErro(err.message) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }
  if (!consorcio) return <p className="text-gray-500">Consórcio não encontrado.</p>

  const cotasVendidas = cotas.length || '—'

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link href="/consorcios" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <ChevronLeft size={16} /> Consórcios
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{consorcio.nome}</h1>
            <Badge status={consorcio.status} />
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link href={`/consorcios/${id}/editar`} className="btn-secondary">
                <Pencil size={15} /> Editar
              </Link>
              <button onClick={handleDelete} className="btn-danger">
                <Trash2 size={15} /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Cotas" value={consorcio.quantidadecotas} sub="total do consórcio" />
        <MetricCard
          label="Valor Mensal"
          value={`R$ ${Number(consorcio.valormensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          sub="por cota"
        />
        <MetricCard
          label="Prêmio"
          value={`R$ ${Number(consorcio.valorpremio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          sub="valor por sorteio"
        />
        <MetricCard
          label="Duração"
          value={`${consorcio.datainicio?.slice(0, 7)} → ${consorcio.datafim?.slice(0, 7)}`}
          sub={`dia ${consorcio.diaassembleia} de cada mês`}
        />
      </div>

      {/* Alerts */}
      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 size={15} className="shrink-0" /> {msg}
        </div>
      )}
      {erro && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <AlertCircle size={15} className="shrink-0" /> {erro}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab: Informações ── */}
      {tab === 'Informações' && (
        <div className="card">
          <h2 className="section-title mb-4">Detalhes do Consórcio</h2>
          <dl className="divide-y divide-gray-100">
            {[
              ['Taxa de Administração', `${(consorcio.taxaadministracao * 100).toFixed(0)}%`],
              ['Fundo de Reserva', `${(consorcio.fundoreserva * 100).toFixed(0)}%`],
              ['Dia da Assembleia', `Dia ${consorcio.diaassembleia}`],
              ['Data de Início', consorcio.datainicio?.slice(0, 10)],
              ['Data de Fim', consorcio.datafim?.slice(0, 10)],
              ['Status', <Badge key="s" status={consorcio.status} />],
            ].map(([k, v]) => (
              <div key={k} className="flex py-3 gap-4">
                <dt className="w-48 shrink-0 text-sm font-medium text-gray-500">{k}</dt>
                <dd className="text-sm text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* ── Tab: Cotas ── */}
      {tab === 'Cotas' && (
        <div className="space-y-5">
          {consorcio.status !== 'FINALIZADO' && (
            <div className="card border border-indigo-100 bg-indigo-50/30">
              <h2 className="section-title mb-4">Adquirir Cotas</h2>
              <form onSubmit={handleComprarCotas} className="flex items-end gap-3 max-w-sm">
                <div className="flex-1">
                  <label className="label">Quantidade Desejada</label>
                  <input
                    type="number"
                    min="1"
                    max={consorcio.quantidadecotas - cotas.length > 0 ? consorcio.quantidadecotas - cotas.length : 1}
                    value={quantidadeCotas}
                    onChange={(e) => setQuantidadeCotas(Number(e.target.value))}
                    required
                    className="input"
                    disabled={comprando}
                  />
                </div>
                <button type="submit" disabled={comprando} className="btn-primary shrink-0">
                  {comprando ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />} 
                  Comprar
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-3">As cotas adquiridas aparecerão na sua lista de Minhas Cotas.</p>
            </div>
          )}

          {cotas.length === 0 ? (
            <div className="card py-12 text-center">
              <Users size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Nenhuma cota vendida ainda.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="th">Nº</th>
                    <th className="th">Participante</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {cotas.map((c) => (
                    <tr key={c.cot_id} className="tr-hover">
                      <td className="td font-bold text-gray-900">#{c.numero}</td>
                      <td className="td text-gray-700">{c.nome ?? c.usu_id}</td>
                      <td className="td"><Badge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Assembleias ── */}
      {tab === 'Assembleias' && (
        <div className="space-y-5">
          {corrente?.assembleia && (
            <div className="card ring-indigo-100 bg-indigo-50/50">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays size={16} className="text-indigo-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Assembleia Corrente</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">nº {corrente.assembleia.numero}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Data: {corrente.assembleia.data?.slice(0, 10)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {corrente.pagamentosConfirmados} / {corrente.totalCotas}
                  </p>
                  <p className="text-sm text-gray-500">pagamentos confirmados</p>

                  <div className="mt-2 h-2 w-40 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${corrente.totalCotas ? (corrente.pagamentosConfirmados / corrente.totalCotas) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-indigo-100">
                  {corrente.podeRealizarSorteio ? (
                    <button
                      onClick={() => handleSorteio(corrente.assembleia.id)}
                      disabled={sorteioLoading}
                      className="btn-primary"
                    >
                      {sorteioLoading
                        ? <><Loader2 size={16} className="animate-spin" /> Realizando...</>
                        : <><Dice5 size={16} /> Realizar Sorteio</>
                      }
                    </button>
                  ) : (
                    <p className="text-sm text-amber-700 flex items-center gap-2">
                      <AlertCircle size={14} />
                      Aguardando confirmação de todos os pagamentos para realizar o sorteio.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {assembleias.length === 0 ? (
            <div className="card py-12 text-center">
              <CalendarDays size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Nenhuma assembleia encontrada.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="th">Nº</th>
                    <th className="th">Data</th>
                    <th className="th">Cota Contemplada</th>
                    <th className="th">Situação</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {assembleias.map((a) => (
                    <tr key={a.ass_id} className="tr-hover">
                      <td className="td font-bold text-gray-900">#{a.numero}</td>
                      <td className="td text-gray-600">{a.data?.slice(0, 10)}</td>
                      <td className="td">
                        {a.ass_cot_id
                          ? <span className="flex items-center gap-1.5 text-purple-700"><Trophy size={14} /> Cota #{a.cot_numero ?? a.ass_cot_id}</span>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="td">
                        <Badge status={a.ass_cot_id ? 'FINALIZADO' : 'PENDENTE'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Saldo ── */}
      {tab === 'Saldo' && (
        <div className="space-y-5">
          <div className="card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shrink-0">
              <Wallet size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Saldo atual do consórcio</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {Number(saldo?.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <h2 className="section-title">Movimentações</h2>

          {movimentos.length === 0 ? (
            <div className="card py-12 text-center">
              <TrendingUp size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Nenhuma movimentação registrada.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="th">Data</th>
                    <th className="th">Tipo</th>
                    <th className="th text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {movimentos.map((m) => (
                    <tr key={m.moc_id} className="tr-hover">
                      <td className="td text-gray-500">{m.moc_data?.slice(0, 10)}</td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          {m.moc_tipo === 'ENTRADA'
                            ? <TrendingUp size={14} className="text-emerald-600" />
                            : <TrendingDown size={14} className="text-red-500" />
                          }
                          <Badge status={m.moc_tipo} />
                        </div>
                      </td>
                      <td className={`td text-right font-semibold ${m.moc_tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {m.moc_tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(m.moc_valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
