export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

export function urgencyClass(days) {
  if (days === null) return ''
  if (days < 0) return 'bg-red-50 border-l-4 border-red-500'
  if (days <= 7) return 'bg-red-50 border-l-4 border-red-400'
  if (days <= 30) return 'bg-orange-50 border-l-4 border-orange-400'
  if (days <= 90) return 'bg-yellow-50 border-l-4 border-yellow-300'
  return ''
}

export function urgencyBadge(days) {
  if (days === null) return { text: 'N/A', cls: 'bg-gray-100 text-gray-500' }
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, cls: 'bg-red-100 text-red-700' }
  if (days === 0) return { text: 'Today', cls: 'bg-red-100 text-red-700' }
  if (days <= 7) return { text: `${days}d`, cls: 'bg-red-100 text-red-700' }
  if (days <= 30) return { text: `${days}d`, cls: 'bg-orange-100 text-orange-700' }
  if (days <= 90) return { text: `${days}d`, cls: 'bg-yellow-100 text-yellow-700' }
  return { text: `${days}d`, cls: 'bg-green-100 text-green-700' }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function estimatedRenewalFee(jurisdiction, classCount) {
  const baseFees = {
    'United States': 400,
    'European Union': 850,
    'United Kingdom': 200,
    'Germany': 290,
    'France': 290,
    'Japan': 380,
    'China': 250,
    'Australia': 400,
    'Canada': 350,
    'Brazil': 200,
    'India': 80,
    'Mexico': 180,
    'South Korea': 320,
    'Switzerland': 420,
    'Netherlands': 290,
    'Spain': 200,
    'Italy': 200,
    'Singapore': 360,
    'South Africa': 100,
    'UAE': 300,
  }
  const base = baseFees[jurisdiction] || 300
  const perClass = jurisdiction === 'European Union' ? 150 : 50
  return base + (classCount - 1) * perClass
}
