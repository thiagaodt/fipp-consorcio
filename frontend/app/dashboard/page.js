'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getUser, isAuthenticated } from '@/lib/api'
import Badge from '@/components/Badge'
import {
  Building2, Ticket, Wallet, Plus, ArrowRight,
  TrendingUp, AlertCircle,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
  }
  return (
    <div className="card flex items-start gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const user = getUser()
  const [consorcios, setConsorcios] = useState([])
  const [cotas, setCotas] = useState([])
  const [saldo, setSaldo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    async function load() {
      const [c, q, s] = await Promise.allSettled([
        api.get('/consorcio/meus'),
        api.get('/cota/'),
        api.get('/saldo/administrador'),
      ])
      if (c.status === 'fulfilled') setConsorcios(c.value)
      if (q.status === 'fulfilled') setCotas(q.value)
      if (s.status === 'fulfilled') setSaldo(s.value)
      setLoading(false)
    }
    load()
  }, [])

  const emProcesso = consorcios.filter((c) => c.status === 'EM PROCESSO').length
  const cotasAtivas = cotas.filter((c) => c.status === 'REGULAR').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Bom dia, {user?.nome?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Aqui está o resumo da sua plataforma.</p>
        </div>
        <Link href="/consorcios/novo" className="btn-primary">
          <Plus size={17} />
          Novo Consórcio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={Building2}
          label="Consórcios ativos"
          value={emProcesso}
          sub={`${consorcios.length} total`}
          color="indigo"
        />
        <StatCard
          icon={Ticket}
          label="Minhas cotas ativas"
          value={cotasAtivas}
          sub={`${cotas.length} total`}
          color="amber"
        />
        <StatCard
          icon={Wallet}
          label="Saldo de administrador"
          value={`R$ ${Number(saldo?.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          sub="disponível para saque"
          color="emerald"
        />
      </div>

      {/* My consortiums table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Meus Consórcios</h2>
          <Link href="/consorcios" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {consorcios.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <Building2 size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Você ainda não criou nenhum consórcio.</p>
            <Link href="/consorcios/novo" className="btn-primary mt-4">
              <Plus size={16} /> Criar primeiro consórcio
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="th rounded-tl-xl">Nome</th>
                  <th className="th">Cotas</th>
                  <th className="th">Valor Mensal</th>
                  <th className="th">Prêmio</th>
                  <th className="th">Status</th>
                  <th className="th rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {consorcios.map((c) => (
                  <tr key={c.con_id} className="tr-hover">
                    <td className="td font-medium text-gray-900">{c.nome}</td>
                    <td className="td">{c.quantidadecotas}</td>
                    <td className="td">R$ {Number(c.valormensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="td">R$ {Number(c.valorpremio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="td"><Badge status={c.status} /></td>
                    <td className="td">
                      <Link href={`/consorcios/${c.con_id}`} className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center gap-1">
                        Acessar <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My quotas */}
      {cotas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Minhas Cotas</h2>
            <Link href="/cotas" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cotas.slice(0, 6).map((c) => (
              <div key={c.cot_id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Cota nº {c.cot_numero}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.con_nome ?? `Consórcio ${c.cot_con_id}`}</p>
                </div>
                <Badge status={c.cot_status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
