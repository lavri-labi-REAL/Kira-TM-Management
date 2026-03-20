import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import { X, Globe, TrendingUp } from 'lucide-react'
import { useTrademarks } from '../../hooks/useTrademarks'
import { Badge } from '../../components/ui/Badge'
import { StatCard } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'
import { SearchInput } from '../../components/common/SearchInput'
import { STATUSES, NICE_CLASSES } from '../../data/mockTrademarks'
import { formatDate } from '../../utils/deadlineUtils'
import { statusBadgeClass } from '../../utils/statusColors'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Map country names to ISO numeric codes for react-simple-maps
const COUNTRY_TO_ISO = {
  'United States': '840',
  'European Union': null, // EU is a supranational entity
  'United Kingdom': '826',
  'Germany': '276',
  'France': '250',
  'Japan': '392',
  'China': '156',
  'Australia': '036',
  'Canada': '124',
  'Brazil': '076',
  'India': '356',
  'Mexico': '484',
  'South Korea': '410',
  'Switzerland': '756',
  'Netherlands': '528',
  'Spain': '724',
  'Italy': '380',
  'Sweden': '752',
  'Norway': '578',
  'Denmark': '208',
  'Singapore': '702',
  'South Africa': '710',
  'UAE': '784',
  'Russia': '643',
  'Argentina': '032',
  'Chile': '152',
  'Colombia': '170',
  'Turkey': '792',
  'Poland': '616',
  'Czech Republic': '203',
}

// Map ISO numeric to country name
const ISO_TO_COUNTRY = Object.fromEntries(
  Object.entries(COUNTRY_TO_ISO).filter(([, v]) => v).map(([k, v]) => [v, k])
)

function interpolateColor(count, max) {
  if (count === 0) return '#F3F4F6'
  const t = Math.min(count / Math.max(max, 1), 1)
  // From light orange to deep orange
  const r = Math.round(254 + (249 - 254) * t)
  const g = Math.round(215 + (115 - 215) * t)
  const b = Math.round(170 + (22 - 170) * t)
  return `rgb(${r},${g},${b})`
}

export default function WorldMapDashboard() {
  const { data: trademarks = [], isLoading } = useTrademarks()

  const [statusFilter, setStatusFilter] = useState('All')
  const [classFilter, setClassFilter] = useState('All')
  const [ownerFilter, setOwnerFilter] = useState('All')
  const [tooltip, setTooltip] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [selectedCountry, setSelectedCountry] = useState(null)
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    let list = trademarks
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter)
    if (classFilter !== 'All') list = list.filter(t => t.niceClasses?.includes(Number(classFilter)))
    if (ownerFilter !== 'All') list = list.filter(t => t.owner === ownerFilter)
    return list
  }, [trademarks, statusFilter, classFilter, ownerFilter])

  const countByCountry = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      if (t.jurisdiction) {
        map[t.jurisdiction] = (map[t.jurisdiction] || 0) + 1
      }
    })
    return map
  }, [filtered])

  const maxCount = useMemo(() => Math.max(...Object.values(countByCountry), 1), [countByCountry])

  const owners = useMemo(() => [...new Set(trademarks.map(t => t.owner).filter(Boolean))], [trademarks])

  const activeJurisdictions = Object.keys(countByCountry).length
  const totalMarksOnMap = filtered.length

  const mostActive = useMemo(() => {
    const sorted = Object.entries(countByCountry).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || '—'
  }, [countByCountry])

  const selectedMarks = useMemo(() => {
    if (!selectedCountry) return []
    return filtered.filter(t => t.jurisdiction === selectedCountry)
  }, [filtered, selectedCountry])

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">World Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">Geographic distribution of your trademark portfolio</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
          <option value="All">All Classes</option>
          {NICE_CLASSES.map(nc => <option key={nc.value} value={nc.value}>Class {nc.value}</option>)}
        </select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
          <option value="All">All Owners</option>
          {owners.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="flex gap-6">
        {/* Map */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden relative">
          <ComposableMap
            projectionConfig={{ scale: 140, center: [10, 10] }}
            style={{ width: '100%', height: '460px' }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const isoNum = geo.id
                    const countryName = ISO_TO_COUNTRY[isoNum]
                    const count = countryName ? (countByCountry[countryName] || 0) : 0
                    const fill = count > 0 ? interpolateColor(count, maxCount) : '#F3F4F6'
                    const isSelected = countryName === selectedCountry

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isSelected ? '#FFA600' : fill}
                        stroke="#D1D5DB"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: count > 0 ? '#FFA600' : '#E5E7EB', outline: 'none', cursor: count > 0 ? 'pointer' : 'default' },
                          pressed: { outline: 'none' },
                        }}
                        onMouseEnter={(e) => {
                          if (countryName && count > 0) {
                            const breakdown = {}
                            filtered.filter(t => t.jurisdiction === countryName).forEach(t => {
                              breakdown[t.status] = (breakdown[t.status] || 0) + 1
                            })
                            setTooltip({ country: countryName, count, breakdown })
                            setTooltipPos({ x: e.clientX, y: e.clientY })
                          }
                        }}
                        onMouseMove={(e) => {
                          if (tooltip) setTooltipPos({ x: e.clientX, y: e.clientY })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => {
                          if (countryName && count > 0) {
                            setSelectedCountry(prev => prev === countryName ? null : countryName)
                          }
                        }}
                      />
                    )
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-2">Trademark Density</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">0</span>
              <div className="h-3 w-32 rounded-full" style={{ background: 'linear-gradient(to right, #F3F4F6, #FED7AA, #F97316)' }} />
              <span className="text-xs text-gray-400">{maxCount}+</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        {selectedCountry && (
          <div className="w-72 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-[#ffa600]/5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{selectedCountry}</h3>
                <p className="text-xs text-gray-500">{selectedMarks.length} trademark{selectedMarks.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="p-1 rounded text-gray-400 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {selectedMarks.map(tm => (
                <div key={tm.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#ffa600]/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => navigate(`/trademarks/${tm.id}`)}
                      className="text-sm font-semibold text-gray-900 hover:text-[#ffa600] transition-colors text-left"
                    >
                      {tm.markName}
                    </button>
                    <Badge status={tm.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{tm.markType} · Classes: {tm.niceClasses?.join(', ')}</p>
                  {tm.registrationDate && <p className="text-xs text-gray-400">Reg: {formatDate(tm.registrationDate)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <StatCard label="Jurisdictions Active" value={activeJurisdictions} icon={<Globe size={20} />} color="orange" />
        <StatCard label="Total Trademarks" value={totalMarksOnMap} icon={<TrendingUp size={20} />} color="blue" />
        <StatCard label="Most Active Jurisdiction" value={mostActive} icon={<Globe size={20} />} color="green" />
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white rounded-xl px-3 py-2.5 shadow-xl pointer-events-none text-xs"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
        >
          <p className="font-semibold mb-1">{tooltip.country}</p>
          <p>{tooltip.count} trademark{tooltip.count !== 1 ? 's' : ''}</p>
          <div className="mt-1 space-y-0.5">
            {Object.entries(tooltip.breakdown).map(([status, cnt]) => (
              <p key={status} className="text-gray-300">{status}: {cnt}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
