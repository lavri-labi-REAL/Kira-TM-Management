import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Bell, BellOff, Trash2, AlertCircle, Calendar, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { useDeadlines, useAddDeadline, useUpdateDeadline, useDeleteDeadline } from '../../hooks/useDeadlines'
import { useTrademarks } from '../../hooks/useTrademarks'
import { StatCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmationModal } from '../../components/common/ConfirmationModal'
import { PageLoader } from '../../components/ui/Spinner'
import { SearchInput } from '../../components/common/SearchInput'
import { formatDate, daysUntil, urgencyClass, urgencyBadge } from '../../utils/deadlineUtils'
import { useForm } from 'react-hook-form'

const DEADLINE_TYPES = ['Renewal', 'Opposition Response', 'Examination Response', 'Opposition Window', 'Payment', 'Other']

function AddDeadlineForm({ trademarks, onSubmit, onCancel, isLoading }) {
  const { register, handleSubmit } = useForm()
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Trademark *</label>
        <select {...register('trademarkId', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
          <option value="">Select a trademark...</option>
          {trademarks.map(t => <option key={t.id} value={t.id}>{t.markName} — {t.jurisdiction}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Deadline Type</label>
          <select {...register('deadlineType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
            {DEADLINE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Due Date *</label>
          <input type="date" {...register('dueDate', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
        <textarea {...register('notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600] resize-none" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Deadline'}</Button>
      </div>
    </form>
  )
}

export default function DeadlineDashboard() {
  const navigate = useNavigate()
  const { data: deadlines = [], isLoading } = useDeadlines()
  const { data: trademarks = [] } = useTrademarks()
  const addMutation = useAddDeadline()
  const updateMutation = useUpdateDeadline()
  const deleteMutation = useDeleteDeadline()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)

  const enriched = useMemo(() => deadlines.map(d => ({
    ...d,
    days: daysUntil(d.dueDate),
  })), [deadlines])

  const stats = useMemo(() => ({
    overdue: enriched.filter(d => d.days !== null && d.days < 0).length,
    thisWeek: enriched.filter(d => d.days !== null && d.days >= 0 && d.days <= 7).length,
    thisMonth: enriched.filter(d => d.days !== null && d.days > 7 && d.days <= 30).length,
    upcoming: enriched.filter(d => d.days !== null && d.days > 30).length,
  }), [enriched])

  const filtered = useMemo(() => {
    let list = enriched
    if (search) list = list.filter(d => d.markName?.toLowerCase().includes(search.toLowerCase()) || d.jurisdiction?.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') list = list.filter(d => d.deadlineType === typeFilter)
    return [...list].sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999))
  }, [enriched, search, typeFilter])

  const handleAdd = async (data) => {
    const tm = trademarks.find(t => t.id === data.trademarkId)
    await addMutation.mutateAsync({
      ...data,
      markName: tm?.markName || 'Unknown',
      jurisdiction: tm?.jurisdiction || '',
      status: 'Upcoming',
      emailNotification: false,
    })
    setShowAdd(false)
    toast.success('Deadline added')
  }

  const toggleNotification = async (dl) => {
    await updateMutation.mutateAsync({ id: dl.id, updates: { emailNotification: !dl.emailNotification } })
    toast.info(dl.emailNotification ? 'Notification disabled' : 'Notification enabled')
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteItem.id)
    setDeleteItem(null)
    toast.success('Deadline removed')
  }

  if (isLoading) return <PageLoader />

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Docketing & Deadlines</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all trademark deadlines</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Deadline
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Overdue" value={stats.overdue} icon={<AlertCircle size={20} />} color="red" />
        <StatCard label="Due This Week" value={stats.thisWeek} icon={<Clock size={20} />} color="orange" />
        <StatCard label="Due This Month" value={stats.thisMonth} icon={<Calendar size={20} />} color="yellow" />
        <StatCard label="All Upcoming" value={stats.upcoming} icon={<Calendar size={20} />} color="blue" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search deadlines..." className="w-full sm:w-64" />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600] w-full sm:w-auto"
        >
          <option value="All">All Types</option>
          {DEADLINE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs text-gray-500 sm:ml-auto self-center">{filtered.length} deadlines</span>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500 font-medium">No deadlines found</p>
          </div>
        ) : filtered.map(dl => {
          const urg = urgencyBadge(dl.days)
          return (
            <div key={dl.id} className={`bg-white rounded-xl border border-gray-200 p-4 ${urgencyClass(dl.days)}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <button onClick={() => navigate(`/trademarks/${dl.trademarkId}`)} className="text-sm font-semibold text-gray-900 hover:text-[#ffa600] transition-colors text-left min-w-0 break-words">
                  {dl.markName}
                </button>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${urg.cls}`}>{urg.text}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-[#ffa600]/10 text-[#C2410C] font-medium px-2 py-0.5 rounded-full">{dl.deadlineType}</span>
                <span className="text-xs text-gray-500">{dl.jurisdiction}</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">Due: {formatDate(dl.dueDate)}</p>
              {dl.notes && <p className="text-xs text-gray-400 mb-3 italic">{dl.notes}</p>}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => toggleNotification(dl)} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${dl.emailNotification ? 'bg-orange-50 text-[#ffa600]' : 'bg-gray-50 text-gray-500'}`}>
                  {dl.emailNotification ? <><Bell size={12} /> Notif On</> : <><BellOff size={12} /> Notif Off</>}
                </button>
                <button onClick={() => setDeleteItem(dl)} className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Remove</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500 font-medium">No deadlines found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="px-4 py-3 text-left">Mark Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Jurisdiction</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Remaining</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dl => {
                const urg = urgencyBadge(dl.days)
                return (
                  <tr key={dl.id} className={`border-b border-gray-100 last:border-0 transition-colors ${urgencyClass(dl.days) || 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/trademarks/${dl.trademarkId}`)} className="text-sm font-semibold text-gray-900 hover:text-[#ffa600] transition-colors">
                        {dl.markName}
                      </button>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs bg-[#ffa600]/10 text-[#C2410C] font-medium px-2 py-0.5 rounded-full">{dl.deadlineType}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{dl.jurisdiction}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(dl.dueDate)}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${urg.cls}`}>{urg.text}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{dl.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleNotification(dl)} className={`p-1.5 rounded-lg transition-colors ${dl.emailNotification ? 'text-[#ffa600] bg-orange-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                          {dl.emailNotification ? <Bell size={14} /> : <BellOff size={14} />}
                        </button>
                        <button onClick={() => setDeleteItem(dl)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Deadline">
        <AddDeadlineForm
          trademarks={trademarks}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          isLoading={addMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Remove Deadline"
        message={`Remove deadline for "${deleteItem?.markName}" (${deleteItem?.deadlineType})?`}
        confirmLabel="Remove"
      />
    </div>
  )
}
