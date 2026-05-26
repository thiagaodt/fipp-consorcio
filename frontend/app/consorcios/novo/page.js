'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react'

const INITIAL = {
  nome: '',
  quantidadecotas: '',
  valorpremio: '',
  taxaadministracao: '',
  fundoreserva: '',
  diaassembleia: '',
  datainicio: '',
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export default function NovoConsorcioPage() {
  const router = useRouter()
  const [form, setForm] = useState(INITIAL)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        quantidadecotas: Number(form.quantidadecotas),
        valorpremio: Number(form.valorpremio),
        taxaadministracao: Number(form.taxaadministracao),
        fundoreserva: Number(form.fundoreserva),
        diaassembleia: Number(form.diaassembleia),
      }
      const res = await api.post('/consorcio', payload)
      router.push(`/consorcios/${res.con_id}`)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalTax = (Number(form.taxaadministracao || 0) + Number(form.fundoreserva || 0)) * 100
  const valorMensal = form.valorpremio && form.quantidadecotas
    ? (Number(form.valorpremio) / Number(form.quantidadecotas)) * (1 + Number(form.taxaadministracao || 0) + Number(form.fundoreserva || 0))
    : null

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link href="/consorcios" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <ChevronLeft size={16} /> Consórcios
        </Link>
        <h1 className="page-title">Criar Consórcio</h1>
        <p className="text-sm text-gray-500 mt-1">Preencha os dados para iniciar um novo consórcio.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card - Informações básicas */}
        <div className="card space-y-5">
          <h2 className="section-title border-b border-gray-100 pb-4">Informações básicas</h2>

          <Field label="Nome do Consórcio">
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Consórcio Imóvel 2025"
              required
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Quantidade de Cotas">
              <input
                type="number"
                name="quantidadecotas"
                value={form.quantidadecotas}
                onChange={handleChange}
                placeholder="Ex: 60"
                required
                min="1"
                className="input"
              />
            </Field>

            <Field label="Dia da Assembleia" hint="Dia do mês (1 a 28)">
              <input
                type="number"
                name="diaassembleia"
                value={form.diaassembleia}
                onChange={handleChange}
                placeholder="Ex: 10"
                required
                min="1"
                max="28"
                className="input"
              />
            </Field>
          </div>

          <Field label="Data de Início">
            <input
              type="date"
              name="datainicio"
              value={form.datainicio}
              onChange={handleChange}
              required
              className="input"
            />
          </Field>
        </div>

        {/* Card - Valores */}
        <div className="card space-y-5">
          <h2 className="section-title border-b border-gray-100 pb-4">Valores e taxas</h2>

          <Field label="Valor do Prêmio (R$)" hint="Valor total que cada participante pode receber ao ser contemplado">
            <input
              type="number"
              name="valorpremio"
              value={form.valorpremio}
              onChange={handleChange}
              placeholder="Ex: 50000.00"
              required
              min="0"
              step="0.01"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Taxa de Administração" hint="Ex: 0.10 = 10%">
              <input
                type="number"
                name="taxaadministracao"
                value={form.taxaadministracao}
                onChange={handleChange}
                placeholder="0.10"
                required
                min="0"
                max="1"
                step="0.01"
                className="input"
              />
            </Field>

            <Field label="Fundo de Reserva" hint="Ex: 0.05 = 5%">
              <input
                type="number"
                name="fundoreserva"
                value={form.fundoreserva}
                onChange={handleChange}
                placeholder="0.05"
                required
                min="0"
                max="1"
                step="0.01"
                className="input"
              />
            </Field>
          </div>

          {/* Preview calc */}
          {valorMensal && (
            <div className="rounded-xl bg-indigo-50 ring-1 ring-indigo-100 p-4 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-indigo-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-indigo-900">Estimativa de parcela mensal</p>
                <p className="text-indigo-700 mt-0.5">
                  R$ {valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês por cota
                  {' '}
                  <span className="text-indigo-500">(total de encargos: {totalTax.toFixed(0)}%)</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {erro && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            <AlertCircle size={15} className="shrink-0" />
            {erro}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Criando...' : 'Criar Consórcio'}
          </button>
        </div>
      </form>
    </div>
  )
}
