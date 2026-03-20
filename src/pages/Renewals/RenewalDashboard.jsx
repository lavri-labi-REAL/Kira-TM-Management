import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, RefreshCw, Upload, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'
import { useTrademarks, useUpdateTrademark } from '../../hooks/useTrademarks'
import { StatCard, Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ConfirmationModal } from '../../components/common/ConfirmationModal'
import { PageLoader } from '../../components/ui/Spinner'
import { formatDate, daysUntil, urgencyBadge, estimatedRenewalFee } from '../../utils/deadlineUtils'

const HORIZON_OPTIONS = [
  { label: '6 Months', months: 6 },
  { label: '12 Months', months: 12 },
  { label: '24 Months', months: 24 },
]

export default function RenewalDashboard() {
  const { data: trademarks = [], isLoading } = useTrademarks()
  const updateMutation = useUpdateTrademark()

  const [horizon, setHorizon] = useState(12)
  const [decisions, setDecisions] = useState({}) // id -> 'renew' | 'expire'
  const [fees, setFees] = useState({})
  const [confirmAction, setConfirmAction] = useState(null) // { id, action }
  const [activeTab, setActiveTab] = useState('upcoming')

  const now = new Date()
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() + horizon)

  const upcoming = useMemo(() => {
    return trademarks
      .filter(t => {
        if (!t.renewalDate) return false
        const d = new Date(t.renewalDate)
        return d >= now && d <= cutoff
      })
      .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
  }, [trademarks, horizon])

  const stats = useMemo(() => {
    const renewed = upcoming.filter(t => decisions[t.id] === 'renew')
    const lapsed = upcoming.filter(t => decisions[t.id] === 'expire')
    const totalFees = upcoming.reduce((sum, t) => {
      const fee = fees[t.id] ?? estimatedRenewalFee(t.jurisdiction, t.niceClasses?.length || 1)
      return sum + fee
    }, 0)
    return { total: upcoming.length, renewed: renewed.length, lapsed: lapsed.length, totalFees }
  }, [upcoming, decisions, fees])

  const handleDecision = (tm, action) => {
    setConfirmAction({ tm, action })
  }

  const confirmDecision = async () => {
    const { tm, action } = confirmAction
    setDecisions(prev => ({ ...prev, [tm.id]: action }))
    if (action === 'expire') {
      await updateMutation.mutateAsync({ id: tm.id, updates: { status: 'Expired' } })
      toast.info(`"${tm.markName}" marked to let expire`)
    } else {
      toast.success(`"${tm.markName}" marked for renewal`)
    }
    setConfirmAction(null)
  }

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Renewal Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage upcoming trademark renewals and fees</p>
        </div>
        {/* Horizon tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {HORIZON_OPTIONS.map(opt => (
            <button
              key={opt.months}
              onClick={() => setHorizon(opt.months)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                horizon === opt.months
                  ? 'bg-[#ffa600] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Renewals Due" value={stats.total} icon={<RefreshCw size={20} />} color="orange" />
        <StatCard label="Decided to Renew" value={stats.renewed} icon={<CheckCircle size={20} />} color="green" />
        <StatCard label="Let Expire" value={stats.lapsed} icon={<XCircle size={20} />} color="red" />
        <StatCard label="Est. Total Fees" value={`$${stats.totalFees.toLocaleString()}`} icon={<DollarSign size={20} />} color="blue" />
      </div>

      {/* Cards grid */}
      {upcoming.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-gray-500 font-medium">No renewals due in this period</p>
          <p className="text-sm text-gray-400 mt-1">Try expanding the horizon to see more.</p>
        </div>
      ) : (
        <>
          {/* Summary table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Renewal Overview</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  <th className="px-4 py-3 text-left">Mark</th>
                  <th className="px-4 py-3 text-left">Jurisdiction</th>
                  <th className="px-4 py-3 text-left">Classes</th>
                  <th className="px-4 py-3 text-left">Due Date</th>
                  <th className="px-4 py-3 text-left">Est. Fee</th>
                  <th className="px-4 py-3 text-left">Decision</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(tm => {
                  const days = daysUntil(tm.renewalDate)
                  const urg = urgencyBadge(days)
                  const estFee = fees[tm.id] ?? estimatedRenewalFee(tm.jurisdiction, tm.niceClasses?.length || 1)
                  const decision = decisions[tm.id]
                  return (
                    <tr key={tm.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">{tm.markName}</p>
                        <p className="text-xs text-gray-400">{tm.markType}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tm.jurisdiction}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {tm.niceClasses?.length || 0} class{tm.niceClasses?.length !== 1 ? 'es' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{formatDate(tm.renewalDate)}</p>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${urg.cls}`}>{urg.text}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">$</span>
                          <input
                            type="number"
                            value={estFee}
                            onChange={e => setFees(prev => ({ ...prev, [tm.id]: Number(e.target.value) }))}
                            className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ffa600]"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {decision ? (
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${decision === 'renew' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {decision === 'renew' ? '✓ Renew' : '✗ Let Expire'}
                          </span>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDecision(tm, 'renew')}
                              className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors"
                            >
                              Renew
                            </button>
                            <button
                              onClick={() => handleDecision(tm, 'expire')}
                              className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-colors"
                            >
                              Let Expire
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3"><Badge status={tm.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Renewal cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map(tm => {
              const days = daysUntil(tm.renewalDate)
              const urg = urgencyBadge(days)
              const estFee = fees[tm.id] ?? estimatedRenewalFee(tm.jurisdiction, tm.niceClasses?.length || 1)
              const decision = decisions[tm.id]
              return (
                <Card key={tm.id} className={decision === 'renew' ? 'border-green-200' : decision === 'expire' ? 'border-red-200' : ''}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{tm.markName}</h3>
                      <p className="text-xs text-gray-500">{tm.jurisdiction}</p>
                    </div>
                    <Badge status={tm.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div>
                      <p className="text-gray-400">Classes</p>
                      <p className="font-medium text-gray-700">{tm.niceClasses?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Due</p>
                      <p className="font-medium text-gray-700">{formatDate(tm.renewalDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Remaining</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${urg.cls}`}>{urg.text}</span>
                    </div>
                    <div>
                      <p className="text-gray-400">Est. Fee</p>
                      <p className="font-semibold text-gray-900">${estFee.toLocaleString()}</p>
                    </div>
                  </div>
                  {decision ? (
                    <div className={`text-center py-2 rounded-lg text-sm font-medium ${decision === 'renew' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {decision === 'renew' ? '✓ Marked for Renewal' : '✗ Will Let Expire'}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleDecision(tm, 'renew')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors">
                        <CheckCircle size={14} /> Renew
                      </button>
                      <button onClick={() => handleDecision(tm, 'expire')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors">
                        <XCircle size={14} /> Let Expire
                      </button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Confirm decision modal */}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmDecision}
        title={confirmAction?.action === 'renew' ? 'Confirm Renewal' : 'Confirm Let Expire'}
        message={
          confirmAction?.action === 'renew'
            ? `Mark "${confirmAction?.tm?.markName}" (${confirmAction?.tm?.jurisdiction}) for renewal?`
            : `Let "${confirmAction?.tm?.markName}" (${confirmAction?.tm?.jurisdiction}) expire? This will update the trademark status to Expired.`
        }
        confirmLabel={confirmAction?.action === 'renew' ? 'Confirm Renewal' : 'Let Expire'}
        variant={confirmAction?.action === 'renew' ? 'success' : 'danger'}
      />
    </div>
  )
}
