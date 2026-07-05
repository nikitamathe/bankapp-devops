import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../lib/api'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { Bell, CheckCheck, Check } from 'lucide-react'
import { format } from 'date-fns'

const typeStyles = {
  DEPOSIT_SUCCESS:    { cls: 'bg-green-50 border-green-200',  dot: 'bg-green-500'  },
  WITHDRAWAL_SUCCESS: { cls: 'bg-red-50 border-red-200',      dot: 'bg-red-500'    },
  TRANSFER_SUCCESS:   { cls: 'bg-blue-50 border-blue-200',    dot: 'bg-blue-500'   },
  LOW_BALANCE:        { cls: 'bg-orange-50 border-orange-200',dot: 'bg-orange-500' },
  ACCOUNT_CREATED:    { cls: 'bg-purple-50 border-purple-200',dot: 'bg-purple-500' },
  ACCOUNT_CLOSED:     { cls: 'bg-gray-50 border-gray-200',    dot: 'bg-gray-400'   },
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data: notifPage, isLoading } = useQuery({
    queryKey: ['notifications', { page: 0, size: 50 }],
    queryFn: () => notificationApi.list({ page: 0, size: 50 }).then((r) => r.data.data),
  })

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => toast.error('Failed to mark as read'),
  })

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      toast.success('All notifications marked as read')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => toast.error('Failed to mark all as read'),
  })

  const notifications = notifPage?.content ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              className="btn-secondary"
              disabled={markAllMutation.isPending}
            >
              {markAllMutation.isPending ? <Spinner size="sm" /> : <><CheckCheck size={16} /> Mark all read</>}
            </button>
          )
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          subtitle="You'll see alerts here when transactions occur or your balance is low"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const style = typeStyles[n.type] ?? typeStyles.ACCOUNT_CLOSED
            return (
              <div
                key={n.id}
                className={`card border flex items-start gap-4 transition-opacity ${
                  n.read ? 'opacity-60' : ''
                } ${style.cls}`}
              >
                {/* Dot */}
                <div className="mt-1 flex-shrink-0">
                  <span className={`block w-2.5 h-2.5 rounded-full ${n.read ? 'bg-gray-300' : style.dot}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">
                      {format(new Date(n.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                    {n.transactionReference && (
                      <span className="text-xs font-mono text-gray-400">{n.transactionReference}</span>
                    )}
                  </div>
                </div>

                {/* Mark read */}
                {!n.read && (
                  <button
                    onClick={() => markReadMutation.mutate(n.id)}
                    disabled={markReadMutation.isPending}
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-white/60 transition-colors"
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
