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
  const [assembleias, setAssembleias] = useState({})
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [pixLoading, setPixLoading] = useState(null)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const [pixData, setPixData] = useState(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    api.get('/cota/minhas')
      .then(async (data) => {
        setCotas(data)
        const pags = {}
        const assems = {}
        await Promise.all(
          data.map(async (c) => {
            try { pags[c.id] = await api.get(`/pagamento/cota/${c.id}`) } catch {}
            try { assems[c.id] = await api.get(`/assembleia/consorcio/${c.con_id}`) } catch {}
          })
        )
        setPagamentos(pags)
        setAssembleias(assems)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handlePix(cot_id, ass_id) {
    setMsg(''); setErro('');
    setPixData(null);
    setPixLoading(`${cot_id}-${ass_id}`);
    try {
      const res = await api.post('/pagamento/pix', { cot_id, ass_id });
      setPixData(res.pix?.data || res.pix);
      setMsg(`PIX gerado com sucesso! Valor: R$ ${Number(res.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
    } catch (err) {
      setErro(err.message);
    } finally {
      setPixLoading(null);
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

      {pixData && (
        <div className="card flex flex-col items-center justify-center p-6 space-y-4 bg-indigo-50 border border-indigo-100">
          <h3 className="font-semibold text-lg text-indigo-900">Pague via PIX</h3>
          <p className="text-sm text-indigo-700 text-center">Escaneie o QR Code abaixo ou copie o código Copia e Cola para realizar o pagamento.</p>
          {pixData.qrCodeUrl && (
            <div className="bg-white p-2 rounded-xl border border-indigo-200">
              <img src={pixData.qrCodeUrl} alt="QR Code PIX" className="w-48 h-48" />
            </div>
          )}
          {pixData.qrCode && (
            <div className="w-full max-w-md flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase text-indigo-700">PIX Copia e Cola</span>
              <div className="flex bg-white border border-indigo-200 rounded-lg overflow-hidden">
                <input 
                  type="text" 
                  readOnly 
                  value={pixData.qrCode} 
                  className="w-full text-xs p-3 text-gray-700 outline-none bg-transparent"
                />
                <button 
                  className="bg-indigo-600 text-white px-4 text-xs font-medium hover:bg-indigo-700 transition"
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.qrCode);
                    setMsg('Código PIX copiado!');
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>
          )}
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
            const assems = assembleias[cota.id] ?? []
            
            const assembleiasNaoPagas = assems.filter(a => {
              const payment = pags.find(p => p.pag_ass_id === a.id)
              return !payment || payment.pag_status !== 'CONFIRMADO'
            })
            assembleiasNaoPagas.sort((a, b) => a.numero - b.numero)

            const corrente = assembleiasNaoPagas.length > 0 ? assembleiasNaoPagas[0] : null
            const futuras = assembleiasNaoPagas.length > 1 ? assembleiasNaoPagas.slice(1) : []
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
                    {corrente && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        1 parcela do mês
                      </span>
                    )}
                  </div>
                </div>

                {/* Pagamento Corrente */}
                {corrente && (
                  <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 divide-y divide-amber-100 overflow-hidden">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pagar Assembleia do Mês</p>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Assembleia nº {corrente.numero}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Vencimento próximo</p>
                      </div>
                      <button
                        onClick={() => handlePix(cota.id, corrente.id)}
                        disabled={pixLoading === `${cota.id}-${corrente.id}`}
                        className="btn-primary text-xs px-3 py-2"
                      >
                        {pixLoading === `${cota.id}-${corrente.id}`
                          ? <><Loader2 size={13} className="animate-spin" /> Gerando...</>
                          : <><QrCode size={13} /> Pagar agora</>
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* Pagamentos Futuros (Adiantamento) */}
                {futuras.length > 0 && (
                  <div className="rounded-xl bg-blue-50 ring-1 ring-blue-100 divide-y divide-blue-100 overflow-hidden mt-4">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Adiantar Parcelas Futuras</p>
                    </div>
                    {futuras.map((a) => {
                      const key = `${cota.id}-${a.id}`
                      return (
                        <div key={a.id} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Assembleia nº {a.numero}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePix(cota.id, a.id)}
                            disabled={pixLoading === key}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 rounded-lg text-xs px-3 py-2 font-medium transition"
                          >
                            {pixLoading === key
                              ? <><Loader2 size={13} className="animate-spin" /> Gerando...</>
                              : <><QrCode size={13} /> Adiantar</>
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
