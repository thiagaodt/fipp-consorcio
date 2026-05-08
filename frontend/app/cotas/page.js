'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, isAuthenticated } from '@/lib/api'

export default function CotasPage() {
  const router = useRouter()
  const [cotas, setCotas] = useState([])
  const [pagamentos, setPagamentos] = useState({})
  const [loading, setLoading] = useState(true)
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
            try {
              const p = await api.get(`/pagamento/cota/${c.cot_id}`)
              pags[c.cot_id] = p
            } catch {}
          })
        )
        setPagamentos(pags)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handlePix(cot_id, ass_id) {
    setMsg('')
    setErro('')
    try {
      const res = await api.post('/pagamento/pix', { cot_id, ass_id })
      setMsg(`PIX gerado! Valor: R$ ${Number(res.valor).toFixed(2)}. Escaneie o QR Code no app do seu banco.`)
    } catch (err) {
      setErro(err.message)
    }
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1>Minhas Cotas</h1>

      {msg && <p>{msg}</p>}
      {erro && <p>{erro}</p>}

      {cotas.length === 0 && <p>Nenhuma cota encontrada.</p>}

      {cotas.map((cota) => {
        const pags = pagamentos[cota.cot_id] ?? []
        const pendentes = pags.filter((p) => p.pag_status === 'PENDENTE')

        return (
          <div key={cota.cot_id}>
            <h2>
              Cota nº {cota.cot_numero} — {cota.con_nome ?? `Consórcio ${cota.cot_con_id}`}
            </h2>
            <p>Status: {cota.cot_status}</p>

            {pendentes.length > 0 && (
              <div>
                <h3>Pagamentos Pendentes</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Assembleia</th>
                      <th>Valor</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendentes.map((p) => (
                      <tr key={p.pag_id}>
                        <td>nº {p.ass_numero ?? p.pag_ass_id}</td>
                        <td>R$ {Number(p.pag_valor).toFixed(2)}</td>
                        <td>
                          <button onClick={() => handlePix(cota.cot_id, p.pag_ass_id)}>
                            Pagar via PIX
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pags.length > 0 && (
              <details>
                <summary>Histórico de pagamentos ({pags.length})</summary>
                <table>
                  <thead>
                    <tr>
                      <th>Assembleia</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Data Pagamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pags.map((p) => (
                      <tr key={p.pag_id}>
                        <td>nº {p.ass_numero ?? p.pag_ass_id}</td>
                        <td>R$ {Number(p.pag_valor).toFixed(2)}</td>
                        <td>{p.pag_status}</td>
                        <td>{p.pag_datapagamento?.slice(0, 10) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
          </div>
        )
      })}
    </div>
  )
}
