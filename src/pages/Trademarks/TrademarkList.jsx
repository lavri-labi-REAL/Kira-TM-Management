import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronUp, ChevronDown, Eye, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useTrademarks, useAddTrademark, useUpdateTrademark, useDeleteTrademark } from '../../hooks/useTrademarks'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ConfirmationModal } from '../../components/common/ConfirmationModal'
import { SearchInput } from '../../components/common/SearchInput'
import { PageLoader } from '../../components/ui/Spinner'
import { TrademarkForm } from './TrademarkForm'
import { formatDate } from '../../utils/deadlineUtils'
import { STATUSES } from '../../data/mockTrademarks'

export default function TrademarkList() {
  const navigate = useNavigate()
  const { data: trademarks = [], isLoading } = useTrademarks()
  const addMutation = useAddTrademark()
  const updateMutation = useUpdateTrademark()
  const deleteMutation = useDeleteTrademark()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortKey, setSortKey] = useState('markName')
  const [sortDir, setSortDir] = useState('asc')
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const filtered = useMemo(() => {
    let list = trademarks
    if (search) list = list.filter(t => t.markName.toLowerCase().includes(search.toLowerCase()) || t.jurisdiction?.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter)
    list = [...list].sort((a, b) => {
      const va = a[sortKey] || ''
      const vb = b[sortKey] || ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return list
  }, [trademarks, search, statusFilter, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-gray-300" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#ffa600]" /> : <ChevronDown size={12} className="text-[#ffa600]" />
  }

  const handleAdd = async (data) => {
    await addMutation.mutateAsync(data)
    setShowAdd(false)
    toast.success('Trademark added successfully')
  }

  const handleUpdate = async (data) => {
    await updateMutation.mutateAsync({ id: editItem.id, updates: data })
    setEditItem(null)
    toast.success('Trademark updated successfully')
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteItem.id)
    setDeleteItem(null)
    toast.success('Trademark deleted')
  }

  if (isLoading) return <PageLoader />

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trademark Portfolio</h1>
          <p className="text-sm text-gray-500 mt-0.5">{trademarks.length} marks across {[...new Set(trademarks.map(t=>t.jurisdiction))].length} jurisdictions</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Trademark
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or jurisdiction..." className="w-full sm:w-64" />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600] w-full sm:w-auto"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-500 sm:ml-auto self-center">{filtered.length} results</span>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">No trademarks found</p>
          </div>
        ) : filtered.map(tm => (
          <div key={tm.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <button
                onClick={() => navigate(`/trademarks/${tm.id}`)}
                className="font-semibold text-gray-900 hover:text-[#ffa600] transition-colors text-sm text-left"
              >
                {tm.markName}
              </button>
              <Badge status={tm.status} />
            </div>
            <p className="text-xs text-gray-400 mb-2">{tm.applicationNumber}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
              <div><span className="text-gray-400">Type: </span><span className="text-gray-700">{tm.markType}</span></div>
              <div><span className="text-gray-400">Jurisdiction: </span><span className="text-gray-700">{tm.jurisdiction}</span></div>
              <div><span className="text-gray-400">Classes: </span><span className="text-gray-700">{tm.niceClasses?.join(', ')}</span></div>
              <div><span className="text-gray-400">Renewal: </span><span className="text-gray-700">{formatDate(tm.renewalDate)}</span></div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => navigate(`/trademarks/${tm.id}`)} className="flex-1 py-1.5 text-xs font-medium text-[#ffa600] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">View</button>
              <button onClick={() => setEditItem(tm)} className="flex-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
              <button onClick={() => setDeleteItem(tm)} className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">No trademarks found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new trademark.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort('markName')} className="flex items-center gap-1 hover:text-gray-700">
                    Mark Name <SortIcon col="markName" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Classes</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort('jurisdiction')} className="flex items-center gap-1 hover:text-gray-700">
                    Jurisdiction <SortIcon col="jurisdiction" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort('renewalDate')} className="flex items-center gap-1 hover:text-gray-700">
                    Next Deadline <SortIcon col="renewalDate" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tm => (
                <tr key={tm.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/trademarks/${tm.id}`)} className="font-semibold text-gray-900 hover:text-[#ffa600] transition-colors text-sm">
                      {tm.markName}
                    </button>
                    {tm.applicationNumber && <p className="text-xs text-gray-400 mt-0.5">{tm.applicationNumber}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tm.markType}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {tm.niceClasses?.slice(0, 3).map(c => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{c}</span>
                      ))}
                      {tm.niceClasses?.length > 3 && <span className="text-xs text-gray-400">+{tm.niceClasses.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tm.jurisdiction}</td>
                  <td className="px-4 py-3"><Badge status={tm.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(tm.renewalDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/trademarks/${tm.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#ffa600] hover:bg-orange-50 transition-colors"><Eye size={15} /></button>
                      <button onClick={() => setEditItem(tm)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteItem(tm)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Trademark" size="lg">
        <TrademarkForm
          defaultValues={{ markType: 'Word', status: 'Filed' }}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          isLoading={addMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Trademark" size="lg">
        {editItem && (
          <TrademarkForm
            defaultValues={editItem}
            onSubmit={handleUpdate}
            onCancel={() => setEditItem(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Trademark"
        message={`Are you sure you want to delete "${deleteItem?.markName}" (${deleteItem?.jurisdiction})? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
