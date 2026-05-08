'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getUser } from '@/lib/api'

const TABS = ['Informações', 'Cotas', 'Assembleias', 'Saldo']

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
  const [usuarios, setUsuarios] = useState([])
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const [novaCota, setNovaCota] = useState({ usu_id: '' })
  const [sorteioLoading, setSorteioLoading] = useState(false)

  const isAdmin = consorcio && user && consorcio.con_usu_id === user.id

  useEffect(() => {
    async function load() {
      try {
        const [c, u] = await Promise.all([
          api.get(`/consorcio/${id}`),
          api.get('/usuario'),
        ])
        setConsorcio(c)
        setUsuarios(u)
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
    const data = await api.get(`/cota/consorcio/${id}`)
    setCotas(data)
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

  async function handleAddCota(e) {
    e.preventDefault()
    setErro('')
    setMsg('')
    try {
      const res = await api.post('/cota', { con_id: Number(id), usu_id: Number(novaCota.usu_id) })
      setMsg(`Cota ${res.cot_numero} criada com sucesso!`)
      setNovaCota({ usu_id: '' })
      loadCotas()
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleSorteio(ass_id) {
    setSorteioLoading(true)
    setErro('')
    setMsg('')
    try {
      const res = await api.post(`/assembleia/${ass_id}/realizar`)
      setMsg(`Sorteio realizado! Cota contemplada: nº ${res.cot_numero}`)
      loadAssembleias()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSorteioLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Deseja excluir este consórcio?')) return
    try {
      await api.delete(`/consorcio/${id}`)
      router.push('/consorcios')
    } catch (err) {
      setErro(err.message)
    }
  }

  if (loading) return <p>Carregando...</p>
  if (!consorcio) return <p>Consórcio não encontrado.</p>

  return (
    <div>
      <h1>{consorcio.con_nome}</h1>
      <span>{consorcio.con_status}</span>

      {isAdmin && (
        <span>
          <Link href={`/consorcios/${id}/editar`}>Editar</Link>
          {' | '}
          <button onClick={handleDelete}>Excluir</button>
        </span>
      )}

      {msg && <p>{msg}</p>}
      {erro && <p>{erro}</p>}

      <div>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} disabled={tab === t}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Informações' && (
        <table>
          <tbody>
            <tr><td>Quantidade de Cotas</td><td>{consorcio.con_quantidadecotas}</td></tr>
            <tr><td>Valor do Prêmio</td><td>R$ {Number(consorcio.con_valorpremio).toFixed(2)}</td></tr>
            <tr><td>Valor Mensal</td><td>R$ {Number(consorcio.con_valormensal).toFixed(2)}</td></tr>
            <tr><td>Taxa de Administração</td><td>{(consorcio.con_taxaadministracao * 100).toFixed(0)}%</td></tr>
            <tr><td>Fundo de Reserva</td><td>{(consorcio.con_fundoreserva * 100).toFixed(0)}%</td></tr>
            <tr><td>Dia da Assembleia</td><td>{consorcio.con_diaassembleia}</td></tr>
            <tr><td>Data de Início</td><td>{consorcio.con_datainicio?.slice(0, 10)}</td></tr>
            <tr><td>Data de Fim</td><td>{consorcio.con_datafim?.slice(0, 10)}</td></tr>
          </tbody>
        </table>
      )}

      {tab === 'Cotas' && (
        <div>
          <h2>Cotas</h2>

          {isAdmin && consorcio.con_status !== 'FINALIZADO' && (
            <form onSubmit={handleAddCota}>
              <label>Adicionar Cota para:</label>
              <select
                value={novaCota.usu_id}
                onChange={(e) => setNovaCota({ usu_id: e.target.value })}
                required
              >
                <option value="">Selecione um usuário</option>
                {usuarios.map((u) => (
                  <option key={u.usu_id} value={u.usu_id}>
                    {u.usu_nome} ({u.usu_email})
                  </option>
                ))}
              </select>
              <button type="submit">Adicionar</button>
            </form>
          )}

          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Participante</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cotas.map((c) => (
                <tr key={c.cot_id}>
                  <td>{c.cot_numero}</td>
                  <td>{c.usu_nome ?? c.cot_usu_id}</td>
                  <td>{c.cot_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Assembleias' && (
        <div>
          <h2>Assembleias</h2>

          {corrente?.assembleia && (
            <div>
              <h3>Assembleia Corrente — nº {corrente.assembleia.ass_numero}</h3>
              <p>Data: {corrente.assembleia.ass_data?.slice(0, 10)}</p>
              <p>
                Pagamentos confirmados: {corrente.pagamentosConfirmados} / {corrente.totalCotas}
              </p>
              {isAdmin && corrente.podeRealizarSorteio && (
                <button
                  onClick={() => handleSorteio(corrente.assembleia.ass_id)}
                  disabled={sorteioLoading}
                >
                  {sorteioLoading ? 'Realizando...' : 'Realizar Sorteio'}
                </button>
              )}
              {isAdmin && !corrente.podeRealizarSorteio && (
                <p>Aguardando confirmação de todos os pagamentos.</p>
              )}
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Cota Contemplada</th>
              </tr>
            </thead>
            <tbody>
              {assembleias.map((a) => (
                <tr key={a.ass_id}>
                  <td>{a.ass_numero}</td>
                  <td>{a.ass_data?.slice(0, 10)}</td>
                  <td>{a.ass_cot_id ? `Cota ${a.cot_numero ?? a.ass_cot_id}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Saldo' && (
        <div>
          <h2>Saldo do Consórcio</h2>
          <p>R$ {Number(saldo?.valor ?? 0).toFixed(2)}</p>

          <h3>Movimentações</h3>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {movimentos.map((m) => (
                <tr key={m.moc_id}>
                  <td>{m.moc_data?.slice(0, 10)}</td>
                  <td>{m.moc_tipo}</td>
                  <td>R$ {Number(m.moc_valor).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
