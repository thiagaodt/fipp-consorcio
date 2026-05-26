'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ChevronLeft, AlertCircle } from 'lucide-react'

export default function EditarConsorcioPage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState(null)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/consorcio/${id}`).then((c) => {
      setForm({
        nome: c.con_nome,
        quantidadecotas: c.con_quantidadecotas,
        valorpremio: c.con_valorpremio,
        taxaadministracao: c.con_taxaadministracao,
        fundoreserva: c.con_fundoreserva,
        diaassembleia: c.con_diaassembleia,
        datainicio: c.con_datainicio?.slice(0, 10),
      })
    })
  }, [id])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await api.put(`/consorcio/${id}`, {
        ...form,
        quantidadecotas: Number(form.quantidadecotas),
        valorpremio: Number(form.valorpremio),
        taxaadministracao: Number(form.taxaadministracao),
        fundoreserva: Number(form.fundoreserva),
        diaassembleia: Number(form.diaassembleia),
      })
      router.push(`/consorcios/${id}`)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href={`/consorcios/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <ChevronLeft size={16} /> Voltar ao Consórcio
        </Link>
        <h1 className="page-title">Editar Consórcio</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-5">
          <h2 className="section-title border-b border-gray-100 pb-4">Informações básicas</h2>

          <div>
            <label className="label">Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} required className="input" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label">Quantidade de Cotas</label>
              <input type="number" name="quantidadecotas" value={form.quantidadecotas} onChange={handleChange} required className="input" />
            </div>
            <div>
              <label className="label">Dia da Assembleia</label>
              <input type="number" name="diaassembleia" value={form.diaassembleia} onChange={handleChange} required min="1" max="28" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Data de Início</label>
            <input type="date" name="datainicio" value={form.datainicio} onChange={handleChange} required className="input" />
          </div>
        </div>

        <div className="card space-y-5">
          <h2 className="section-title border-b border-gray-100 pb-4">Valores e taxas</h2>

          <div>
            <label className="label">Valor do Prêmio (R$)</label>
            <input type="number" name="valorpremio" value={form.valorpremio} onChange={handleChange} required step="0.01" className="input" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label">Taxa de Administração</label>
              <input type="number" name="taxaadministracao" value={form.taxaadministracao} onChange={handleChange} required step="0.01" className="input" />
            </div>
            <div>
              <label className="label">Fundo de Reserva</label>
              <input type="number" name="fundoreserva" value={form.fundoreserva} onChange={handleChange} required step="0.01" className="input" />
            </div>
          </div>
        </div>

        {erro && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            <AlertCircle size={15} className="shrink-0" /> {erro}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
