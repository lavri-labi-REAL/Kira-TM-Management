import { statusBadgeClass } from '../../utils/statusColors'

export function Badge({ status, className = '' }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadgeClass(status)} ${className}`}>
      {status}
    </span>
  )
}

export function TagBadge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-700',
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    red:    'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}
