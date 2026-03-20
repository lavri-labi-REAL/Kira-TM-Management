let deadlineStore = null

function loadFromStorage() {
  try {
    const stored = localStorage.getItem('kira_deadlines')
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem('kira_deadlines', JSON.stringify(data))
  } catch {}
}

const defaultDeadlines = [
  {
    id: 'dl-001',
    trademarkId: 'tm-001',
    markName: 'Kirkira',
    jurisdiction: 'United States',
    deadlineType: 'Renewal',
    dueDate: '2030-01-10',
    notes: '10-year renewal due',
    emailNotification: true,
    status: 'Upcoming',
  },
  {
    id: 'dl-002',
    trademarkId: 'tm-002',
    markName: 'Kirkira (Figurative)',
    jurisdiction: 'European Union',
    deadlineType: 'Renewal',
    dueDate: '2030-02-28',
    notes: '10-year EUTM renewal',
    emailNotification: true,
    status: 'Upcoming',
  },
  {
    id: 'dl-003',
    trademarkId: 'tm-003',
    markName: 'LexiCore',
    jurisdiction: 'United Kingdom',
    deadlineType: 'Renewal',
    dueDate: '2032-03-20',
    notes: '',
    emailNotification: false,
    status: 'Upcoming',
  },
  {
    id: 'dl-004',
    trademarkId: 'tm-004',
    markName: 'TrustMark Pro',
    jurisdiction: 'Germany',
    deadlineType: 'Opposition Response',
    dueDate: '2026-04-10',
    notes: 'Response to opposition by TrustBrand GmbH due',
    emailNotification: true,
    status: 'Upcoming',
  },
  {
    id: 'dl-005',
    trademarkId: 'tm-006',
    markName: 'DocuVault',
    jurisdiction: 'China',
    deadlineType: 'Examination Response',
    dueDate: '2026-03-28',
    notes: 'Response to examination office action',
    emailNotification: true,
    status: 'Upcoming',
  },
  {
    id: 'dl-006',
    trademarkId: 'tm-009',
    markName: 'PolicyAI',
    jurisdiction: 'Brazil',
    deadlineType: 'Examination Response',
    dueDate: '2026-03-22',
    notes: 'Respond to INPI examination',
    emailNotification: true,
    status: 'Upcoming',
  },
  {
    id: 'dl-007',
    trademarkId: 'tm-010',
    markName: 'PolicyAI',
    jurisdiction: 'Mexico',
    deadlineType: 'Opposition Window',
    dueDate: '2026-04-10',
    notes: '3-month opposition window from publication',
    emailNotification: false,
    status: 'Upcoming',
  },
  {
    id: 'dl-008',
    trademarkId: 'tm-013',
    markName: 'SmartClause',
    jurisdiction: 'South Korea',
    deadlineType: 'Opposition Window',
    dueDate: '2026-03-25',
    notes: '2-month opposition window',
    emailNotification: true,
    status: 'Upcoming',
  },
  {
    id: 'dl-009',
    trademarkId: 'tm-016',
    markName: 'LegalFlow',
    jurisdiction: 'Spain',
    deadlineType: 'Examination Response',
    dueDate: '2026-03-19',
    notes: 'Overdue — urgent response required',
    emailNotification: true,
    status: 'Overdue',
  },
  {
    id: 'dl-010',
    trademarkId: 'tm-018',
    markName: 'ContractBot',
    jurisdiction: 'UAE',
    deadlineType: 'Examination Response',
    dueDate: '2026-05-15',
    notes: 'First examination response',
    emailNotification: false,
    status: 'Upcoming',
  },
  {
    id: 'dl-011',
    trademarkId: 'tm-005',
    markName: 'DocuVault',
    jurisdiction: 'Japan',
    deadlineType: 'Renewal',
    dueDate: '2031-08-25',
    notes: '10-year renewal',
    emailNotification: false,
    status: 'Upcoming',
  },
  {
    id: 'dl-012',
    trademarkId: 'tm-011',
    markName: 'ComplianceHub',
    jurisdiction: 'India',
    deadlineType: 'Renewal',
    dueDate: '2033-01-08',
    notes: '',
    emailNotification: false,
    status: 'Upcoming',
  },
  {
    id: 'dl-013',
    trademarkId: 'tm-015',
    markName: 'DataLedger',
    jurisdiction: 'Netherlands',
    deadlineType: 'Renewal',
    dueDate: '2033-02-20',
    notes: '',
    emailNotification: false,
    status: 'Upcoming',
  },
]

export function getDeadlines() {
  if (!deadlineStore) {
    deadlineStore = loadFromStorage() || [...defaultDeadlines]
  }
  return deadlineStore
}

export function saveDeadlines(data) {
  deadlineStore = data
  saveToStorage(data)
}

export function addDeadline(deadline) {
  const newDl = { ...deadline, id: `dl-${Date.now()}` }
  const updated = [...getDeadlines(), newDl]
  saveDeadlines(updated)
  return newDl
}

export function updateDeadline(id, updates) {
  const updated = getDeadlines().map(d => d.id === id ? { ...d, ...updates } : d)
  saveDeadlines(updated)
}

export function deleteDeadline(id) {
  const updated = getDeadlines().filter(d => d.id !== id)
  saveDeadlines(updated)
  return updated
}
