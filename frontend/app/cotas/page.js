'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [pollingAtivo, setPollingAtivo] = useState(false)
  const pollingRef = useRef(null)

  useEffect(() => {
    if (!pixData) {
      clearTimeout(pollingRef.current)
      setPollingAtivo(false)
      return
    }

    let tentativas = 0
    const MAX_TENTATIVAS = 72 // ~6 min

    function poll() {
      if (tentativas >= MAX_TENTATIVAS) {
        setPollingAtivo(false)
        setErro('Tempo de espera do PIX esgotado. Gere um novo QR Code.')
        setPixData(null)
        return
      }
      tentativas++
      api.get(`/pagamento/verificar?pag_id=${pixData.pag_id}&abacate_id=${pixData.id}`)
        .then((r) => {
          if (r.status === 'PAID') {
            setPollingAtivo(false)
            setPixData(null)
            setMsg('Pagamento confirmado com sucesso!')
            setTimeout(() => window.location.reload(), 1500)
          } else if (r.status === 'EXPIRED' || r.status === 'CANCELLED') {
            setPollingAtivo(false)
            setPixData(null)
            setErro('PIX expirado ou cancelado. Gere um novo QR Code.')
          } else {
            pollingRef.current = setTimeout(poll, 5000)
          }
        })
        .catch(() => {
          pollingRef.current = setTimeout(poll, 5000)
        })
    }

    setPollingAtivo(true)
    pollingRef.current = setTimeout(poll, 5000)

    return () => clearTimeout(pollingRef.current)
  }, [pixData?.id])

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
      const pd = res.pix?.data || res.pix;
      pd.pag_id = res.pag_id;
      setPixData(pd);
      setMsg(`PIX gerado com sucesso! Valor: R$ ${Number(res.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
    } catch (err) {
      setErro(err.message);
    } finally {
      setPixLoading(null);
    }
  }

  async function simularPagamentoDev() {
    if (!pixData?.id) return;
    try {
      await api.post('/pagamento/simular', { abacate_id: pixData.id });
      setMsg('Pagamento simulado no AbacatePay. Aguardando confirmação...');
    } catch (err) {
      setErro(err.message);
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
          {pixData.brCodeBase64 && (
            <div className="bg-white p-2 rounded-xl border border-indigo-200">
              <img src={pixData.brCodeBase64} alt="QR Code PIX" className="w-48 h-48" />
            </div>
          )}
          {pixData.brCode && (
            <div className="w-full max-w-md flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase text-indigo-700">PIX Copia e Cola</span>
              <div className="flex bg-white border border-indigo-200 rounded-lg overflow-hidden">
                <input 
                  type="text" 
                  readOnly 
                  value={pixData.brCode} 
                  className="w-full text-xs p-3 text-gray-700 outline-none bg-transparent"
                />
                <button 
                  className="bg-indigo-600 text-white px-4 text-xs font-medium hover:bg-indigo-700 transition"
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.brCode);
                    setMsg('Código PIX copiado!');
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>
          )}
          {pollingAtivo && (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <Loader2 size={16} className="animate-spin" />
              Aguardando confirmação do pagamento...
            </div>
          )}
          <button
            onClick={simularPagamentoDev}
            className="mt-2 w-full max-w-md bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 font-semibold py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle2 size={16} /> Simular Pagamento (Dev)
          </button>
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
            
            const assembleiasSorted = [...assems].sort((a,b) => a.numero - b.numero);
            const isOpen = expanded[cota.id];
            let hasFoundCurrent = false;

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
                  </div>
                </div>

                {/* Cronograma de Parcelas / Assembleias */}
                <div className="rounded-xl ring-1 ring-gray-200 divide-y divide-gray-100 overflow-hidden mt-4">
                   <button 
                      onClick={() => toggleExpanded(cota.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                   >
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                         Cronograma de Parcelas ({assembleiasSorted.length})
                      </p>
                      {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                   </button>
                   {isOpen && assembleiasSorted.map(a => {
                      const payment = pags.find(p => p.ass_id === a.id);
                      const isPaid = payment && payment.status === 'CONFIRMADO';
                      const key = `${cota.id}-${a.id}`;
                      const dataVencimento = a.data ? new Date(a.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '—';
                      
                      let rowBg = 'bg-white';
                      let btn = null;
                      let statusText = '';
                      let statusColor = '';

                      if (isPaid) {
                         rowBg = 'bg-emerald-50';
                         statusText = 'Pago em ' + (payment.datapagamento ? new Date(payment.datapagamento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : dataVencimento);
                         statusColor = 'text-emerald-700';
                         btn = (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                               <CheckCircle2 size={16} /> Pago
                            </span>
                         );
                      } else {
                         if (!hasFoundCurrent) {
                            hasFoundCurrent = true;
                            // Corrente
                            rowBg = 'bg-amber-50/60';
                            statusText = 'Vencimento: ' + dataVencimento;
                            statusColor = 'text-amber-700';
                            btn = (
                                <button
                                    onClick={() => handlePix(cota.id, a.id)}
                                    disabled={pixLoading === key}
                                    className="btn-primary text-xs px-3 py-2"
                                  >
                                    {pixLoading === key
                                      ? <><Loader2 size={13} className="animate-spin" /> Gerando...</>
                                      : <><QrCode size={13} /> Pagar agora</>
                                    }
                                  </button>
                            );
                         } else {
                            // Futuras
                            rowBg = 'bg-blue-50/30';
                            statusText = 'Vencimento: ' + dataVencimento;
                            statusColor = 'text-blue-600';
                            btn = (
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
                            );
                         }
                      }

                      return (
                         <div key={a.id} className={`flex items-center justify-between px-4 py-3 ${rowBg}`}>
                           <div>
                             <p className="text-sm font-medium text-gray-900">
                               Assembleia nº {a.numero}
                             </p>
                             <p className={`text-xs mt-0.5 font-medium ${statusColor}`}>{statusText}</p>
                           </div>
                           <div>{btn}</div>
                         </div>
                      )
                   })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
