'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, isAuthenticated } from '@/lib/api'

export default function SaldoPage() {
  const router = useRouter()
  const [saldo, setSaldo] = useState(null)
  const [movimentos, setMovimentos] = useState([])
  const [valor, setValor] = useState('')
  const [loading, setLoading] = useState(true)
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
    setMsg('')
    setErro('')
    try {
      const res = await api.post('/saldo/administrador/saque', { valor: Number(valor) })
      setMsg(`Saque de R$ ${Number(res.valor).toFixed(2)} realizado com sucesso!`)
      setValor('')
      load()
    } catch (err) {
      setErro(err.message)
    }
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1>Saldo de Administrador</h1>

      <p>Saldo atual: R$ {Number(saldo?.valor ?? 0).toFixed(2)}</p>

      <h2>Realizar Saque</h2>
      <form onSubmit={handleSaque}>
        <label>Valor (R$)</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />
        <button type="submit">Sacar</button>
      </form>

      {msg && <p>{msg}</p>}
      {erro && <p>{erro}</p>}

      <h2>Movimentações</h2>
      {movimentos.length === 0 ? (
        <p>Nenhuma movimentação encontrada.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Consórcio</th>
            </tr>
          </thead>
          <tbody>
            {movimentos.map((m) => (
              <tr key={m.moa_id}>
                <td>{m.moa_data?.slice(0, 10)}</td>
                <td>{m.moa_tipo}</td>
                <td>R$ {Number(m.moa_valor).toFixed(2)}</td>
                <td>{m.con_nome ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
