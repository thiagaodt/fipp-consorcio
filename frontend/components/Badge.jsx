const VARIANTS = {
  'EM PROCESSO':  'bg-blue-50 text-blue-700 ring-blue-600/20',
  'FINALIZADO':   'bg-gray-100 text-gray-600 ring-gray-500/20',
  'CONFIRMADO':   'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'PENDENTE':     'bg-amber-50 text-amber-700 ring-amber-500/20',
  'CONTEMPLADA':  'bg-purple-50 text-purple-700 ring-purple-600/20',
  'REGULAR':      'bg-sky-50 text-sky-700 ring-sky-600/20',
  'ENTRADA':      'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'SAIDA':        'bg-red-50 text-red-700 ring-red-600/20',
  'CREDITO':      'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'SAQUE':        'bg-orange-50 text-orange-700 ring-orange-600/20',
}

export default function Badge({ status }) {
  const cls = VARIANTS[status] ?? 'bg-gray-100 text-gray-600 ring-gray-500/20'
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {status}
    </span>
  )
}
