'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, isAuthenticated } from '@/lib/api'
import Badge from '@/components/Badge'
import { Plus, Building2, ArrowRight, AlertCircle } from 'lucide-react'

export default function ConsorciosPage() {
  const router = useRouter()
  const [consorcios, setConsorcios] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    api.get('/consorcio')
      .then(setConsorcios)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Consórcios Ativos</h1>
          <p className="text-sm text-gray-500 mt-1">{consorcios.length} consórcio(s) encontrado(s)</p>
        </div>
        <Link href="/consorcios/novo" className="btn-primary">
          <Plus size={17} />
          Novo Consórcio
        </Link>
      </div>

      {erro && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <AlertCircle size={15} className="shrink-0" />
          {erro}
        </div>
      )}

      {consorcios.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900">Nenhum consórcio criado</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Crie seu primeiro consórcio e comece a gerenciar cotas e assembleias.
          </p>
          <Link href="/consorcios/novo" className="btn-primary mt-6">
            <Plus size={16} /> Criar Consórcio
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="th">Nome</th>
                <th className="th">Cotas</th>
                <th className="th">Valor Mensal</th>
                <th className="th">Prêmio</th>
                <th className="th">Início</th>
                <th className="th">Fim</th>
                <th className="th">Status</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {consorcios.map((c) => (
                <tr key={c.id} className="tr-hover">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                        <Building2 size={16} className="text-indigo-600" />
                      </div>
                      <span className="font-semibold text-gray-900">{c.nome}</span>
                    </div>
                  </td>
                  <td className="td text-gray-600">{c.quantidadecotas}</td>
                  <td className="td font-medium text-gray-900">
                    R$ {Number(c.valormensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="td text-gray-600">
                    R$ {Number(c.valorpremio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="td text-gray-500">{c.datainicio?.slice(0, 10)}</td>
                  <td className="td text-gray-500">{c.datafim?.slice(0, 10)}</td>
                  <td className="td"><Badge status={c.status} /></td>
                  <td className="td">
                    <Link
                      href={`/consorcios/${c.id}`}
                      className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                    >
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
  )
}
