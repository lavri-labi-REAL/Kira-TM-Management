const DOC_TYPES = ['Office Action', 'Certificate', 'Invoice', 'Correspondence', 'Other']

let documentStore = null

function loadFromStorage() {
  try {
    const stored = localStorage.getItem('kira_documents')
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem('kira_documents', JSON.stringify(data))
  } catch {}
}

const defaultDocuments = [
  {
    id: 'doc-001',
    trademarkId: 'tm-001',
    fileName: 'Kirkira_US_Registration_Certificate.pdf',
    fileType: 'Certificate',
    uploadedDate: '2020-01-15',
    size: '245 KB',
    url: null,
    extractedText: 'CERTIFICATE OF REGISTRATION\nUnited States Patent and Trademark Office\nMark: KIRKIRA\nRegistration No: 6,123,456\nDate of Registration: January 10, 2020\nOwner: Kirkira Holdings Ltd.',
  },
  {
    id: 'doc-002',
    trademarkId: 'tm-001',
    fileName: 'USPTO_Office_Action_2019.pdf',
    fileType: 'Office Action',
    uploadedDate: '2019-06-20',
    size: '187 KB',
    url: null,
    extractedText: 'OFFICE ACTION\nSerial No: 88/123,456\nMark: KIRKIRA\nThis action is in response to the application filed March 15, 2019.\nSuspension noted pending likelihood of confusion inquiry.',
  },
  {
    id: 'doc-003',
    trademarkId: 'tm-002',
    fileName: 'EUIPO_Registration_Kirkira_Figurative.pdf',
    fileType: 'Certificate',
    uploadedDate: '2020-03-05',
    size: '312 KB',
    url: null,
    extractedText: 'EUROPEAN UNION TRADE MARK CERTIFICATE\nEUTM No: 018234567\nMark: KIRKIRA (Figurative)\nOwner: Kirkira Holdings Ltd.\nDate of Registration: 28 February 2020',
  },
  {
    id: 'doc-004',
    trademarkId: 'tm-004',
    fileName: 'DE_Opposition_Notice.pdf',
    fileType: 'Correspondence',
    uploadedDate: '2022-07-05',
    size: '98 KB',
    url: null,
    extractedText: 'NOTICE OF OPPOSITION\nDeutsches Patent- und Markenamt\nApplication No: DE 30 2022 005 123\nOpponent: TrustBrand GmbH\nGrounds: Likelihood of confusion with earlier mark.',
  },
  {
    id: 'doc-005',
    trademarkId: 'tm-005',
    fileName: 'JPO_Certificate_DocuVault.pdf',
    fileType: 'Certificate',
    uploadedDate: '2021-09-01',
    size: '278 KB',
    url: null,
    extractedText: 'TRADEMARK REGISTRATION CERTIFICATE\nJapan Patent Office\nRegistration No: 6543210\nMark: DocuVault\nDate: August 25, 2021',
  },
  {
    id: 'doc-006',
    trademarkId: 'tm-007',
    fileName: 'AU_NexaSign_Registration.pdf',
    fileType: 'Certificate',
    uploadedDate: '2022-02-01',
    size: '221 KB',
    url: null,
    extractedText: 'IP AUSTRALIA\nCERTIFICATE OF REGISTRATION OF TRADE MARK\nTrade Mark: NexaSign\nNumber: 2234567\nRegistration Date: 15 January 2022',
  },
  {
    id: 'doc-007',
    trademarkId: 'tm-011',
    fileName: 'India_ComplianceHub_Invoice.pdf',
    fileType: 'Invoice',
    uploadedDate: '2021-12-10',
    size: '56 KB',
    url: null,
    extractedText: 'INVOICE\nAgent: Legal Associates India\nService: Trademark Registration — Class 35, 42, 45\nAmount: INR 12,500\nDate: December 10, 2021',
  },
  {
    id: 'doc-008',
    trademarkId: 'tm-014',
    fileName: 'INPI_France_KirkiraPro_Certificate.pdf',
    fileType: 'Certificate',
    uploadedDate: '2021-05-20',
    size: '198 KB',
    url: null,
    extractedText: 'CERTIFICAT D\'ENREGISTREMENT\nINPI France\nMarque: KIRKIRA PRO\nNuméro: 20 4 567 890\nDate d\'enregistrement: 10 mai 2021',
  },
  {
    id: 'doc-009',
    trademarkId: 'tm-012',
    fileName: 'CH_AuditTrail_Renewal_Reminder.pdf',
    fileType: 'Correspondence',
    uploadedDate: '2024-01-10',
    size: '45 KB',
    url: null,
    extractedText: 'RENEWAL REMINDER\nIPI Switzerland\nMark: AuditTrail\nRenewal Due: March 20, 2024\nPlease note this mark will expire if renewal fee is not paid.',
  },
  {
    id: 'doc-010',
    trademarkId: 'tm-017',
    fileName: 'Singapore_RiskRadar_Certificate.pdf',
    fileType: 'Certificate',
    uploadedDate: '2023-09-10',
    size: '267 KB',
    url: null,
    extractedText: 'CERTIFICATE OF REGISTRATION OF TRADE MARK\nIntellectual Property Office of Singapore\nMark: RiskRadar (Sound Mark)\nRegistration Date: 1 September 2023',
  },
]

const defaultTimelines = [
  {
    id: 'ev-001',
    trademarkId: 'tm-001',
    date: '2019-03-15',
    type: 'Filing',
    description: 'Application filed with USPTO.',
    documentId: null,
  },
  {
    id: 'ev-002',
    trademarkId: 'tm-001',
    date: '2019-06-20',
    type: 'Correspondence',
    description: 'Office Action received requesting clarification on goods/services.',
    documentId: 'doc-002',
  },
  {
    id: 'ev-003',
    trademarkId: 'tm-001',
    date: '2019-08-20',
    type: 'Publication',
    description: 'Mark published in Official Gazette for opposition.',
    documentId: null,
  },
  {
    id: 'ev-004',
    trademarkId: 'tm-001',
    date: '2020-01-10',
    type: 'Registration',
    description: 'Certificate of Registration issued.',
    documentId: 'doc-001',
  },
  {
    id: 'ev-005',
    trademarkId: 'tm-004',
    date: '2022-01-20',
    type: 'Filing',
    description: 'Application filed with DPMA Germany.',
    documentId: null,
  },
  {
    id: 'ev-006',
    trademarkId: 'tm-004',
    date: '2022-07-01',
    type: 'Opposition',
    description: 'Opposition filed by TrustBrand GmbH.',
    documentId: 'doc-004',
  },
  {
    id: 'ev-007',
    trademarkId: 'tm-012',
    date: '2018-05-14',
    type: 'Filing',
    description: 'Application filed with IPI Switzerland.',
    documentId: null,
  },
  {
    id: 'ev-008',
    trademarkId: 'tm-012',
    date: '2019-03-20',
    type: 'Registration',
    description: 'Mark registered.',
    documentId: null,
  },
  {
    id: 'ev-009',
    trademarkId: 'tm-012',
    date: '2024-03-20',
    type: 'Renewal',
    description: 'Renewal deadline passed — mark expired.',
    documentId: 'doc-009',
  },
]

export { DOC_TYPES }

export function getDocuments() {
  if (!documentStore) {
    documentStore = loadFromStorage()
    if (!documentStore) {
      documentStore = { documents: [...defaultDocuments], timelines: [...defaultTimelines] }
    }
  }
  return documentStore
}

function saveDocuments() {
  saveToStorage(documentStore)
}

export function getDocumentsForTrademark(trademarkId) {
  return getDocuments().documents.filter(d => d.trademarkId === trademarkId)
}

export function getTimelineForTrademark(trademarkId) {
  return getDocuments().timelines
    .filter(e => e.trademarkId === trademarkId)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

export function addDocument(doc) {
  const store = getDocuments()
  const newDoc = { ...doc, id: `doc-${Date.now()}` }
  store.documents.push(newDoc)
  saveDocuments()
  return newDoc
}

export function deleteDocument(id) {
  const store = getDocuments()
  store.documents = store.documents.filter(d => d.id !== id)
  saveDocuments()
}

export function addTimelineEvent(event) {
  const store = getDocuments()
  const newEvent = { ...event, id: `ev-${Date.now()}` }
  store.timelines.push(newEvent)
  saveDocuments()
  return newEvent
}
