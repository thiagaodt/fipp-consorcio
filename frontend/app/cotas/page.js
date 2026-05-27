'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, isAuthenticated } from '@/lib/api'
import Badge from '@/components/Badge'
import {
  Ticket, QrCode, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react'

export default function CotasPage() {
  const router = useRouter()
  const [cotas, setCotas] = useState([])
  const [pagamentos, setPagamentos] = useState({})
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [pixLoading, setPixLoading] = useState(null)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    api.get('/cota/minhas')
      .then(async (data) => {
        setCotas(data)
        const pags = {}
        await Promise.all(
          data.map(async (c) => {
            try { pags[c.id] = await api.get(`/pagamento/cota/${c.id}`) } catch {}
          })
        )
        setPagamentos(pags)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handlePix(cot_id, ass_id) {
    setMsg(''); setErro('')
    setPixLoading(`${cot_id}-${ass_id}`)
    try {
      const res = await api.post('/pagamento/pix', { cot_id, ass_id })
      setMsg(`PIX gerado com sucesso! Valor: R$ ${Number(res.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Use o QR Code no app do seu banco.`)
    } catch (err) {
      setErro(err.message)
    } finally {
      setPixLoading(null)
    }
  }

  function toggleExpanded(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
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
      <div>
        <h1 className="page-title">Minhas Cotas</h1>
        <p className="text-sm text-gray-500 mt-1">{cotas.length} cota(s) registrada(s)</p>
      </div>

      {msg && (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> {msg}
        </div>
      )}
      {erro && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <AlertCircle size={15} className="shrink-0" /> {erro}
        </div>
      )}

      {cotas.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
            <Ticket size={32} className="text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900">Nenhuma cota encontrada</p>
          <p className="text-sm text-gray-500 mt-1">Você ainda não participa de nenhum consórcio.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cotas.map((cota) => {
            const pags = pagamentos[cota.id] ?? []
            const pendentes = pags.filter((p) => p.pag_status === 'PENDENTE')
            const confirmados = pags.filter((p) => p.pag_status === 'CONFIRMADO')
            const isOpen = expanded[cota.id]

            return (
              <div key={cota.id} className="card space-y-4">
                {/* Header da cota */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                      <Ticket size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Cota nº {cota.numero}</p>
                      <p className="text-xs text-gray-500">{cota.con_nome ?? `Consórcio ${cota.con_id}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={cota.status} />
                    {pendentes.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        {pendentes.length} pendente(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Pagamentos pendentes */}
                {pendentes.length > 0 && (
                  <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 divide-y divide-amber-100 overflow-hidden">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pagamentos pendentes</p>
                    </div>
                    {pendentes.map((p) => {
                      const key = `${cota.id}-${p.pag_ass_id}`
                      return (
                        <div key={p.pag_id} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Assembleia nº {p.ass_numero ?? p.pag_ass_id}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              R$ {Number(p.pag_valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePix(cota.id, p.pag_ass_id)}
                            disabled={pixLoading === key}
                            className="btn-primary text-xs px-3 py-2"
                          >
                            {pixLoading === key
                              ? <><Loader2 size={13} className="animate-spin" /> Gerando...</>
                              : <><QrCode size={13} /> Pagar via PIX</>
                            }
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Histórico colapsável */}
                {pags.length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleExpanded(cota.id)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      Histórico de pagamentos ({pags.length})
                    </button>

                    {isOpen && (
                      <div className="mt-3 table-wrapper">
                        <table className="min-w-full">
                          <thead>
                            <tr>
                              <th className="th">Assembleia</th>
                              <th className="th">Valor</th>
                              <th className="th">Status</th>
                              <th className="th">Data Pagamento</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {pags.map((p) => (
                              <tr key={p.pag_id} className="tr-hover">
                                <td className="td font-medium text-gray-900">nº {p.ass_numero ?? p.pag_ass_id}</td>
                                <td className="td">R$ {Number(p.pag_valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="td"><Badge status={p.pag_status} /></td>
                                <td className="td text-gray-500">{p.pag_datapagamento?.slice(0, 10) ?? '—'}</td>
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
          })}
        </div>
      )}
    </div>
  )
}
