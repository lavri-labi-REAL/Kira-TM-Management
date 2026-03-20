import { useState, useMemo } from 'react'
import { Upload, Eye, Trash2, FileText, Tag } from 'lucide-react'
import { toast } from 'react-toastify'
import { useDropzone } from 'react-dropzone'
import { useDocuments, useAddDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { useTrademarks } from '../../hooks/useTrademarks'
import { CertificatePreview } from '../../components/common/CertificatePreview'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmationModal } from '../../components/common/ConfirmationModal'
import { PageLoader, Spinner } from '../../components/ui/Spinner'
import { SearchInput } from '../../components/common/SearchInput'
import { TagBadge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/deadlineUtils'
import { DOC_TYPES } from '../../data/mockDocuments'
import { useForm } from 'react-hook-form'

const TYPE_COLORS = {
  'Certificate': 'green',
  'Office Action': 'red',
  'Invoice': 'orange',
  'Correspondence': 'blue',
  'Other': 'gray',
}

function UploadModal({ trademarks, onClose, onUpload, isLoading }) {
  const { register, handleSubmit } = useForm()
  const [files, setFiles] = useState([])
  const [extracting, setExtracting] = useState(false)
  const [extractedText, setExtractedText] = useState('')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': [], 'image/*': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] },
    onDrop: (accepted) => {
      setFiles(accepted)
      if (accepted.length > 0) {
        setExtracting(true)
        setExtractedText('')
        setTimeout(() => {
          setExtracting(false)
          setExtractedText(`Mock OCR extraction from ${accepted[0].name}\n\nDocument content would appear here.\nThis is simulated extracted text for demonstration purposes.`)
        }, 1500)
      }
    }
  })

  const onSubmit = async (data) => {
    if (files.length === 0) { toast.error('Please select a file'); return }
    await onUpload({
      trademarkId: data.trademarkId,
      fileName: files[0].name,
      fileType: data.fileType,
      uploadedDate: new Date().toISOString().split('T')[0],
      size: `${(files[0].size / 1024).toFixed(0)} KB`,
      url: null,
      extractedText,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-[#ffa600] bg-orange-50' : 'border-gray-300 hover:border-[#ffa600] hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
        {files.length > 0 ? (
          <p className="text-sm font-medium text-green-600">✓ {files[0].name}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">Drop file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, Image, Word documents accepted</p>
          </>
        )}
      </div>

      {extracting && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          <Spinner size="sm" /> Extracting text...
        </div>
      )}

      {extractedText && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Extracted Text Preview</p>
          <textarea readOnly value={extractedText} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-gray-50 font-mono resize-none" />
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Linked Trademark *</label>
        <select {...register('trademarkId', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
          <option value="">Select trademark...</option>
          {trademarks.map(t => <option key={t.id} value={t.id}>{t.markName} — {t.jurisdiction}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Document Type</label>
        <select {...register('fileType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
          {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isLoading || extracting}>
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </form>
  )
}

export default function DocumentList() {
  const { data: documents = [], isLoading } = useDocuments()
  const { data: trademarks = [] } = useTrademarks()
  const addMutation = useAddDocument()
  const deleteMutation = useDeleteDocument()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [tmFilter, setTmFilter] = useState('All')
  const [showUpload, setShowUpload] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [previewItem, setPreviewItem] = useState(null)

  const tmMap = useMemo(() => Object.fromEntries(trademarks.map(t => [t.id, t])), [trademarks])

  const filtered = useMemo(() => {
    let list = documents
    if (search) list = list.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') list = list.filter(d => d.fileType === typeFilter)
    if (tmFilter !== 'All') list = list.filter(d => d.trademarkId === tmFilter)
    return list
  }, [documents, search, typeFilter, tmFilter])

  const handleUpload = async (data) => {
    await addMutation.mutateAsync(data)
    setShowUpload(false)
    toast.success('Document uploaded successfully')
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteItem.id)
    setDeleteItem(null)
    toast.success('Document deleted')
  }

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{documents.length} documents across {[...new Set(documents.map(d => d.trademarkId))].length} trademarks</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload size={16} /> Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search documents..." className="w-64" />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]"
        >
          <option value="All">All Types</option>
          {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select
          value={tmFilter}
          onChange={e => setTmFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]"
        >
          <option value="All">All Trademarks</option>
          {trademarks.map(t => <option key={t.id} value={t.id}>{t.markName} — {t.jurisdiction}</option>)}
        </select>
        <span className="text-xs text-gray-500 ml-auto">{filtered.length} documents</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">📂</div>
            <p className="text-gray-500 font-medium">No documents found</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first document to get started.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="px-4 py-3 text-left">File Name</th>
                <th className="px-4 py-3 text-left">Linked Trademark</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Uploaded</th>
                <th className="px-4 py-3 text-left">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const tm = tmMap[doc.trademarkId]
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setPreviewItem(doc)}
                        className="flex items-center gap-2 hover:text-[#ffa600] transition-colors group"
                      >
                        <FileText size={16} className="text-gray-400 group-hover:text-[#ffa600] flex-shrink-0 transition-colors" />
                        <span className="text-sm font-medium text-gray-800 group-hover:text-[#ffa600] transition-colors">{doc.fileName}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tm ? `${tm.markName} — ${tm.jurisdiction}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <TagBadge color={TYPE_COLORS[doc.fileType] || 'gray'}>{doc.fileType}</TagBadge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(doc.uploadedDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doc.size}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setPreviewItem(doc)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Preview">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setDeleteItem(doc)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="md">
        <UploadModal
          trademarks={trademarks}
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
          isLoading={addMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Delete "${deleteItem?.fileName}"? This cannot be undone.`}
        confirmLabel="Delete"
      />

      {/* Preview Modal */}
      <Modal isOpen={!!previewItem} onClose={() => setPreviewItem(null)} title={previewItem?.fileName} size="xl">
        {previewItem && (() => {
          const tm = tmMap[previewItem.trademarkId]
          const isCertificate = previewItem.fileType === 'Certificate'
          return (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TagBadge color={TYPE_COLORS[previewItem.fileType] || 'gray'}>{previewItem.fileType}</TagBadge>
                <span className="text-xs text-gray-500">{previewItem.size}</span>
                <span className="text-xs text-gray-500">{formatDate(previewItem.uploadedDate)}</span>
                {tm && <span className="text-xs text-gray-500 ml-auto">{tm.markName} — {tm.jurisdiction}</span>}
              </div>
              {isCertificate && tm ? (
                <CertificatePreview doc={previewItem} trademark={tm} />
              ) : previewItem.extractedText ? (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><Tag size={12} /> Extracted Text (OCR)</p>
                  <textarea
                    readOnly
                    value={previewItem.extractedText}
                    rows={14}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 resize-none font-mono"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center">
                  <p className="text-sm text-gray-400">Preview not available</p>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
