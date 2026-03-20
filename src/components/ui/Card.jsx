export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${hover ? 'hover:-translate-y-1 transition-all duration-300 cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, icon, color = 'orange', onClick }) {
  const colors = {
    orange: 'bg-[#ffa600]/10 text-[#ffa600]',
    red:    'bg-red-100 text-red-600',
    green:  'bg-green-100 text-green-600',
    blue:   'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${onClick ? 'cursor-pointer hover:-translate-y-1 transition-all duration-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
