import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { accountApi, transactionApi, notificationApi } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'
import { TransactionTypeBadge, TransactionStatusBadge } from '../components/TransactionBadge'
import { CreditCard, ArrowLeftRight, Bell, DollarSign, ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountApi.list().then((r) => r.data.data),
  })

  const { data: txnPage, isLoading: loadingTxns } = useQuery({
    queryKey: ['transactions', { page: 0, size: 5 }],
    queryFn: () => transactionApi.list({ page: 0, size: 5 }).then((r) => r.data.data),
  })

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.unreadCount().then((r) => r.data.data),
  })

  const transactions = txnPage?.content ?? []
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance ?? 0), 0)
  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE').length

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.username} 👋`}
        subtitle="Here's a summary of your banking activity"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Balance"
          value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Accounts"
          value={activeAccounts}
          icon={CreditCard}
          color="blue"
          sub={`${accounts.length} total`}
        />
        <StatCard
          label="Transactions"
          value={txnPage?.totalElements ?? '—'}
          icon={ArrowLeftRight}
          color="purple"
        />
        <StatCard
          label="Unread Alerts"
          value={countData?.count ?? 0}
          icon={Bell}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts summary */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Your Accounts</h2>
            <Link to="/accounts" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {loadingAccounts ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No accounts yet</p>
          ) : (
            <div className="space-y-3">
              {accounts.slice(0, 4).map((account) => (
                <Link
                  key={account.id}
                  to={`/accounts/${account.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.accountType}</p>
                    <p className="text-xs text-gray-400 font-mono">{account.accountNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-xs ${account.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`}>
                      {account.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
            <Link to="/transactions" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {loadingTxns ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <TransactionTypeBadge type={txn.transactionType} />
                    <div>
                      <p className="text-sm text-gray-700 font-mono">{txn.transactionReference}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(txn.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      txn.transactionType === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.transactionType === 'DEPOSIT' ? '+' : '-'}
                      ${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <TransactionStatusBadge status={txn.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
