import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Edit2, Calendar, Globe, Tag, User, FileText, Plus, Trash2, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { useTrademark, useUpdateTrademark } from '../../hooks/useTrademarks'
import { useTrademarkDocuments, useTimeline, useAddTimelineEvent, useAddDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { ConfirmationModal } from '../../components/common/ConfirmationModal'
import { PageLoader } from '../../components/ui/Spinner'
import { TrademarkForm } from './TrademarkForm'
import { formatDate, daysUntil, urgencyBadge } from '../../utils/deadlineUtils'
import { TIMELINE_TYPE_COLORS, STATUS_BADGE } from '../../utils/statusColors'
import { NICE_CLASSES } from '../../data/mockTrademarks'
import { DOC_TYPES } from '../../data/mockDocuments'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'

function TimelineEventForm({ trademarkId, onClose }) {
  const { register, handleSubmit } = useForm()
  const addEvent = useAddTimelineEvent()

  const onSubmit = async (data) => {
    await addEvent.mutateAsync({ ...data, trademarkId })
    toast.success('Timeline event added')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
          <input type="date" {...register('date', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Event Type</label>
          <select {...register('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
            {Object.keys(TIMELINE_TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
        <textarea {...register('description')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600] resize-none" placeholder="Describe the event..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={addEvent.isPending}>Add Event</Button>
      </div>
    </form>
  )
}

export default function TrademarkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: trademark, isLoading } = useTrademark(id)
  const { data: documents = [] } = useTrademarkDocuments(id)
  const { data: timeline = [] } = useTimeline(id)
  const updateMutation = useUpdateTrademark()
  const addDocMutation = useAddDocument()
  const deleteDocMutation = useDeleteDocument()

  const [showEdit, setShowEdit] = useState(false)
  const [showTimelineForm, setShowTimelineForm] = useState(false)
  const [deleteDocItem, setDeleteDocItem] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': [], 'image/*': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] },
    onDrop: async (files) => {
      for (const file of files) {
        await addDocMutation.mutateAsync({
          trademarkId: id,
          fileName: file.name,
          fileType: 'Other',
          uploadedDate: new Date().toISOString().split('T')[0],
          size: `${(file.size / 1024).toFixed(0)} KB`,
          url: null,
          extractedText: 'Mock extracted text from ' + file.name + '\n\nDocument content would appear here after OCR processing.',
        })
        toast.success(`${file.name} uploaded`)
      }
    }
  })

  const handleUpdate = async (data) => {
    await updateMutation.mutateAsync({ id, updates: data })
    setShowEdit(false)
    toast.success('Trademark updated')
  }

  const handleDeleteDoc = async () => {
    await deleteDocMutation.mutateAsync(deleteDocItem.id)
    setDeleteDocItem(null)
    toast.success('Document deleted')
  }

  if (isLoading) return <PageLoader />
  if (!trademark) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Trademark not found.</p>
      <Button variant="secondary" onClick={() => navigate('/trademarks')} className="mt-4">
        <ArrowLeft size={16} /> Back to Portfolio
      </Button>
    </div>
  )

  const renewalDays = daysUntil(trademark.renewalDate)
  const renewalUrgency = urgencyBadge(renewalDays)

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/trademarks" className="hover:text-[#ffa600]">Portfolio</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{trademark.markName}</span>
      </div>

      {/* Header card */}
      <Card className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/trademarks')} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{trademark.markName}</h1>
                <Badge status={trademark.status} />
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{trademark.markType}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{trademark.owner} · {trademark.jurisdiction}</p>
              {trademark.applicationNumber && (
                <p className="text-xs text-gray-400 mt-0.5">App No: {trademark.applicationNumber}</p>
              )}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
            <Edit2 size={14} /> Edit
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Info + Deadlines */}
        <div className="col-span-2 space-y-5">
          {/* Key Dates */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={16} className="text-[#ffa600]" /> Key Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Filing Date', val: trademark.filingDate },
                { label: 'Publication Date', val: trademark.publicationDate },
                { label: 'Registration Date', val: trademark.registrationDate },
                { label: 'Renewal Date', val: trademark.renewalDate },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(val)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Nice Classes */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag size={16} className="text-[#ffa600]" /> Nice Classes</h2>
            <div className="flex flex-wrap gap-2">
              {trademark.niceClasses?.map(c => {
                const nc = NICE_CLASSES.find(n => n.value === c)
                return (
                  <div key={c} className="bg-[#ffa600]/10 border border-[#ffa600]/20 rounded-lg px-3 py-1.5">
                    <p className="text-xs font-semibold text-[#C2410C]">Class {c}</p>
                    <p className="text-xs text-gray-500">{nc?.label.split(' – ')[1]}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Notes */}
          {trademark.notes && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{trademark.notes}</p>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><FileText size={16} className="text-[#ffa600]" /> Documents</h2>
            </div>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-4 ${isDragActive ? 'border-[#ffa600] bg-orange-50' : 'border-gray-300 hover:border-[#ffa600]'}`}
            >
              <input {...getInputProps()} />
              {addDocMutation.isPending ? (
                <p className="text-sm text-gray-500 animate-pulse">Extracting text... ⏳</p>
              ) : (
                <p className="text-sm text-gray-500">Drop files here or <span className="text-[#ffa600] font-medium">browse</span></p>
              )}
            </div>

            {documents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#ffa600]/30 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-400">{doc.fileType} · {doc.size} · {formatDate(doc.uploadedDate)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <button onClick={() => setPreviewDoc(doc)} className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 text-xs">Preview</button>
                      <button onClick={() => setDeleteDocItem(doc)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Deadlines + Timeline */}
        <div className="space-y-5">
          {/* Upcoming Deadlines */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock size={16} className="text-[#ffa600]" /> Upcoming Deadlines</h2>
            <div className="space-y-2">
              {trademark.renewalDate && (
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs font-medium text-gray-700">Renewal</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(trademark.renewalDate)}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${renewalUrgency.cls}`}>{renewalUrgency.text}</span>
                </div>
              )}
              {!trademark.registrationDate && trademark.publicationDate && (
                <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                  <p className="text-xs font-medium text-sky-700">Opposition Window</p>
                  <p className="text-sm font-semibold text-gray-900">~3 months from publication</p>
                </div>
              )}
              {!trademark.renewalDate && (
                <p className="text-xs text-gray-400 text-center py-2">No deadlines configured.</p>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Case Timeline</h2>
              <button onClick={() => setShowTimelineForm(true)} className="text-xs text-[#ffa600] font-medium hover:underline flex items-center gap-1">
                <Plus size={13} /> Add
              </button>
            </div>

            {showTimelineForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <TimelineEventForm trademarkId={id} onClose={() => setShowTimelineForm(false)} />
              </div>
            )}

            {timeline.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No timeline events yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-4">
                  {timeline.map(event => {
                    const colors = TIMELINE_TYPE_COLORS[event.type] || TIMELINE_TYPE_COLORS.Correspondence
                    return (
                      <div key={event.id} className="flex gap-3 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 z-10 ${colors.bg}`}>
                          {colors.icon}
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>{event.type}</span>
                            <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Trademark" size="lg">
        <TrademarkForm
          defaultValues={trademark}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Document Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteDocItem}
        onClose={() => setDeleteDocItem(null)}
        onConfirm={handleDeleteDoc}
        title="Delete Document"
        message={`Delete "${deleteDocItem?.fileName}"? This cannot be undone.`}
        confirmLabel="Delete"
      />

      {/* Document Preview */}
      <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc?.fileName} size="lg">
        {previewDoc && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <span>{previewDoc.fileType}</span>·<span>{previewDoc.size}</span>·<span>{formatDate(previewDoc.uploadedDate)}</span>
            </div>
            {previewDoc.extractedText ? (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Extracted Text (OCR)</p>
                <textarea
                  readOnly
                  value={previewDoc.extractedText}
                  rows={12}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 resize-none font-mono"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Preview not available</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
