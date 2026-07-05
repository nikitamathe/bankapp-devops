const config = {
  DEPOSIT:    { label: 'Deposit',    cls: 'bg-green-100 text-green-700' },
  WITHDRAWAL: { label: 'Withdrawal', cls: 'bg-red-100 text-red-700' },
  TRANSFER:   { label: 'Transfer',   cls: 'bg-blue-100 text-blue-700' },
}

const statusConfig = {
  SUCCESS: { label: 'Success', cls: 'bg-green-100 text-green-700' },
  PENDING: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  FAILED:  { label: 'Failed',  cls: 'bg-red-100 text-red-700' },
}

export function TransactionTypeBadge({ type }) {
  const c = config[type] ?? { label: type, cls: 'bg-gray-100 text-gray-700' }
  return <span className={`badge ${c.cls}`}>{c.label}</span>
}

export function TransactionStatusBadge({ status }) {
  const c = statusConfig[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700' }
  return <span className={`badge ${c.cls}`}>{c.label}</span>
}
