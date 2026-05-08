'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

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

  if (!form) return <p>Carregando...</p>

  return (
    <div>
      <h1>Editar Consórcio</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Quantidade de Cotas</label>
          <input type="number" name="quantidadecotas" value={form.quantidadecotas} onChange={handleChange} required />
        </div>
        <div>
          <label>Valor do Prêmio (R$)</label>
          <input type="number" name="valorpremio" value={form.valorpremio} onChange={handleChange} required step="0.01" />
        </div>
        <div>
          <label>Taxa de Administração</label>
          <input type="number" name="taxaadministracao" value={form.taxaadministracao} onChange={handleChange} required step="0.01" />
        </div>
        <div>
          <label>Fundo de Reserva</label>
          <input type="number" name="fundoreserva" value={form.fundoreserva} onChange={handleChange} required step="0.01" />
        </div>
        <div>
          <label>Dia da Assembleia</label>
          <input type="number" name="diaassembleia" value={form.diaassembleia} onChange={handleChange} required />
        </div>
        <div>
          <label>Data de Início</label>
          <input type="date" name="datainicio" value={form.datainicio} onChange={handleChange} required />
        </div>

        {erro && <p>{erro}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" onClick={() => router.back()}>Cancelar</button>
      </form>
    </div>
  )
}
