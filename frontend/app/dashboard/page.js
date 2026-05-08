'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getUser, isAuthenticated } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const user = getUser()
  const [consorcios, setConsorcios] = useState([])
  const [cotas, setCotas] = useState([])
  const [saldo, setSaldo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    async function load() {
      try {
        const [c, q, s] = await Promise.allSettled([
          api.get('/consorcio/meus'),
          api.get('/cota/minhas'),
          api.get('/saldo/administrador'),
        ])
        if (c.status === 'fulfilled') setConsorcios(c.value)
        if (q.status === 'fulfilled') setCotas(q.value)
        if (s.status === 'fulfilled') setSaldo(s.value)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1>Bem-vindo, {user?.nome}</h1>

      <section>
        <h2>Meus Consórcios (administrador)</h2>
        <p>{consorcios.length} consórcio(s)</p>
        <Link href="/consorcios">Ver todos</Link>
        {' | '}
        <Link href="/consorcios/novo">Criar novo</Link>
      </section>

      <section>
        <h2>Minhas Cotas</h2>
        <p>{cotas.length} cota(s)</p>
        <Link href="/cotas">Ver minhas cotas</Link>
      </section>

      <section>
        <h2>Saldo de Administrador</h2>
        {saldo !== null ? (
          <p>R$ {Number(saldo.valor ?? saldo).toFixed(2)}</p>
        ) : (
          <p>R$ 0,00</p>
        )}
        <Link href="/saldo">Ver saldo</Link>
      </section>
    </div>
  )
}
