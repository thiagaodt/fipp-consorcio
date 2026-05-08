'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, isAuthenticated } from '@/lib/api'

export default function ConsorciosPage() {
  const router = useRouter()
  const [consorcios, setConsorcios] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    api.get('/consorcio/meus')
      .then(setConsorcios)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1>Meus Consórcios</h1>
      <Link href="/consorcios/novo">Criar novo consórcio</Link>

      {erro && <p>{erro}</p>}

      {consorcios.length === 0 ? (
        <p>Nenhum consórcio encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cotas</th>
              <th>Valor Mensal</th>
              <th>Prêmio</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {consorcios.map((c) => (
              <tr key={c.con_id}>
                <td>{c.con_nome}</td>
                <td>{c.con_quantidadecotas}</td>
                <td>R$ {Number(c.con_valormensal).toFixed(2)}</td>
                <td>R$ {Number(c.con_valorpremio).toFixed(2)}</td>
                <td>{c.con_status}</td>
                <td>
                  <Link href={`/consorcios/${c.con_id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
