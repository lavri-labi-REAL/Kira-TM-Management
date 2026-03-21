import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Clock, FolderOpen, RefreshCw, Globe, ChevronRight, X } from 'lucide-react'

const navItems = [
  { to: '/trademarks', icon: LayoutDashboard, label: 'Portfolio' },
  { to: '/deadlines',  icon: Clock,           label: 'Deadlines' },
  { to: '/documents',  icon: FolderOpen,      label: 'Documents' },
  { to: '/renewals',   icon: RefreshCw,       label: 'Renewals' },
  { to: '/map',        icon: Globe,           label: 'World Map' },
]

export function Sidebar({ onClose }) {
  return (
    <aside className="bg-gray-800 text-white w-64 h-full flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ffa600] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-sm">K</span>
            </div>
            <span className="font-extrabold text-[#ffa600] text-lg tracking-tight">Kirkira TM</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-10">Trademark Management</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-gray-500 uppercase tracking-widest px-3 mb-3">Modules</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#ffa600]/20 text-[#ffa600]'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">v1.0.0 — Kirkira Legal Tech</p>
      </div>
    </aside>
  )
}
