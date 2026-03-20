export const STATUS_BADGE = {
  Filed:      'bg-blue-100 text-blue-700',
  Published:  'bg-sky-100 text-sky-700',
  Registered: 'bg-green-100 text-green-700',
  Opposed:    'bg-yellow-100 text-yellow-700',
  Expired:    'bg-red-100 text-red-700',
}

export const STATUS_DOT = {
  Filed:      'bg-blue-500',
  Published:  'bg-sky-500',
  Registered: 'bg-green-500',
  Opposed:    'bg-yellow-500',
  Expired:    'bg-red-500',
}

export const TIMELINE_TYPE_COLORS = {
  Filing:        { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📋' },
  Publication:   { bg: 'bg-sky-100', text: 'text-sky-700', icon: '📰' },
  Opposition:    { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⚠️' },
  Registration:  { bg: 'bg-green-100', text: 'text-green-700', icon: '✅' },
  Renewal:       { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🔄' },
  Correspondence:{ bg: 'bg-gray-100', text: 'text-gray-700', icon: '✉️' },
}

export function statusBadgeClass(status) {
  return STATUS_BADGE[status] || 'bg-gray-100 text-gray-600'
}
