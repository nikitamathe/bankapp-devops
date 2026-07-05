import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountApi, transactionApi } from '../lib/api'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import { TransactionTypeBadge, TransactionStatusBadge } from '../components/TransactionBadge'
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function AccountDetailPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [modal, setModal] = useState(null) // 'deposit' | 'withdraw' | 'transfer' | 'close'
  const [amount, setAmount] = useState('')
  const [toAccount, setToAccount] = useState('')
  const [description, setDescription] = useState('')

  const { data: account, isLoading } = useQuery({
    queryKey: ['accounts', accountId],
    queryFn: () => accountApi.getById(accountId).then((r) => r.data.data),
  })

  const { data: txnPage, isLoading: loadingTxns } = useQuery({
    queryKey: ['transactions', 'account', account?.accountNumber],
    queryFn: () =>
      transactionApi.getByAccount(account.accountNumber, { page: 0, size: 20 }).then((r) => r.data.data),
    enabled: !!account?.accountNumber,
  })

  const closeMutation = useMutation({
    mutationFn: () => accountApi.close(accountId),
    onSuccess: () => {
      toast.success('Account closed')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      navigate('/accounts')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to close account'),
  })

  const txnMutation = useMutation({
    mutationFn: (payload) => {
      if (modal === 'deposit')  return transactionApi.deposit(payload)
      if (modal === 'withdraw') return transactionApi.withdraw(payload)
      return transactionApi.transfer(payload)
    },
    onSuccess: () => {
      toast.success(`${modal.charAt(0).toUpperCase() + modal.slice(1)} successful`)
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setModal(null)
      setAmount('')
      setToAccount('')
      setDescription('')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Transaction failed'),
  })

  const handleTxn = (e) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) { toast.error('Enter a valid amount'); return }
    if (modal === 'transfer' && !toAccount) { toast.error('Enter destination account number'); return }

    const payload = modal === 'transfer'
      ? { transactionType: 'TRANSFER', amount: parsed, fromAccountNumber: account.accountNumber, toAccountNumber: toAccount, description }
      : { transactionType: modal.toUpperCase(), amount: parsed, accountNumber: account.accountNumber, description }

    txnMutation.mutate(payload)
  }

  const transactions = txnPage?.content ?? []

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!account)  return <p className="text-center text-gray-500 py-20">Account not found</p>

  const isActive = account.status === 'ACTIVE'

  return (
    <div>
      <PageHeader
        title="Account Details"
        action={
          <Link to="/accounts" className="btn-secondary">
            <ArrowLeft size={16} /> Back
          </Link>
        }
      />

      {/* Account card */}
      <div className="card bg-gradient-to-br from-brand-600 to-brand-800 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-brand-200 text-sm">{account.accountType}</p>
            <p className="font-mono text-lg mt-1">{account.accountNumber}</p>
            <p className="text-brand-100 text-sm mt-1">{account.accountHolderName}</p>
          </div>
          <span className={`badge text-xs ${
            account.status === 'ACTIVE' ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'
          }`}>
            {account.status}
          </span>
        </div>
        <p className="text-4xl font-bold mt-6">
          ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-brand-200 text-xs mt-1">
          Opened {format(new Date(account.createdAt), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Action buttons */}
      {isActive && (
        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={() => setModal('deposit')} className="btn-primary">
            <ArrowDownLeft size={16} /> Deposit
          </button>
          <button onClick={() => setModal('withdraw')} className="btn-secondary">
            <ArrowUpRight size={16} /> Withdraw
          </button>
          <button onClick={() => setModal('transfer')} className="btn-secondary">
            <ArrowLeftRight size={16} /> Transfer
          </button>
          <button onClick={() => setModal('close')} className="btn-danger ml-auto">
            <XCircle size={16} /> Close Account
          </button>
        </div>
      )}

      {/* Transaction history */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Transaction History</h2>
        {loadingTxns ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions for this account</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Balance After</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono text-xs text-gray-500">{txn.transactionReference}</td>
                    <td className="py-3"><TransactionTypeBadge type={txn.transactionType} /></td>
                    <td className={`py-3 font-semibold ${
                      txn.transactionType === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.transactionType === 'DEPOSIT' ? '+' : '-'}
                      ${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-gray-700">
                      {txn.balanceAfter != null
                        ? `$${Number(txn.balanceAfter).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className="py-3"><TransactionStatusBadge status={txn.status} /></td>
                    <td className="py-3 text-gray-400 text-xs whitespace-nowrap">
                      {format(new Date(txn.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit / Withdraw / Transfer Modal */}
      {['deposit', 'withdraw', 'transfer'].includes(modal) && (
        <Modal
          open
          onClose={() => setModal(null)}
          title={modal.charAt(0).toUpperCase() + modal.slice(1)}
        >
          <form onSubmit={handleTxn} className="space-y-4">
            {modal === 'transfer' && (
              <div>
                <label className="label">Destination account number</label>
                <input
                  className="input font-mono"
                  placeholder="ACC123456789012"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  disabled={txnMutation.isPending}
                />
              </div>
            )}
            <div>
              <label className="label">Amount ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={txnMutation.isPending}
              />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input
                className="input"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={txnMutation.isPending}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={txnMutation.isPending}>
                {txnMutation.isPending ? <Spinner size="sm" /> : 'Confirm'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Close account confirmation */}
      <Modal open={modal === 'close'} onClose={() => setModal(null)} title="Close Account">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to close account <span className="font-mono font-medium">{account.accountNumber}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => closeMutation.mutate()}
            className="btn-danger flex-1"
            disabled={closeMutation.isPending}
          >
            {closeMutation.isPending ? <Spinner size="sm" /> : 'Close Account'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
