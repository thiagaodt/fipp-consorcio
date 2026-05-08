'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const INITIAL = {
  nome: '',
  quantidadecotas: '',
  valorpremio: '',
  taxaadministracao: '',
  fundoreserva: '',
  diaassembleia: '',
  datainicio: '',
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

  return (
    <div>
      <h1>Criar Consórcio</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Quantidade de Cotas</label>
          <input type="number" name="quantidadecotas" value={form.quantidadecotas} onChange={handleChange} required min="1" />
        </div>
        <div>
          <label>Valor do Prêmio (R$)</label>
          <input type="number" name="valorpremio" value={form.valorpremio} onChange={handleChange} required min="0" step="0.01" />
        </div>
        <div>
          <label>Taxa de Administração (ex: 0.10 para 10%)</label>
          <input type="number" name="taxaadministracao" value={form.taxaadministracao} onChange={handleChange} required min="0" max="1" step="0.01" />
        </div>
        <div>
          <label>Fundo de Reserva (ex: 0.05 para 5%)</label>
          <input type="number" name="fundoreserva" value={form.fundoreserva} onChange={handleChange} required min="0" max="1" step="0.01" />
        </div>
        <div>
          <label>Dia da Assembleia (1-28)</label>
          <input type="number" name="diaassembleia" value={form.diaassembleia} onChange={handleChange} required min="1" max="28" />
        </div>
        <div>
          <label>Data de Início</label>
          <input type="date" name="datainicio" value={form.datainicio} onChange={handleChange} required />
        </div>

        {erro && <p>{erro}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Consórcio'}
        </button>
        <button type="button" onClick={() => router.back()}>Cancelar</button>
      </form>
    </div>
  )
}
