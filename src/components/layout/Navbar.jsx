import { useState } from 'react'
import { Bell, ChevronDown, User, LogOut, Settings, Menu } from 'lucide-react'

export function Navbar({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-[#ffa600]"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="font-extrabold text-[#ffa600] text-lg md:text-xl">Kirkira TM</span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ffa600] rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffa600]"
          >
            <div className="w-7 h-7 bg-[#ffa600] rounded-full flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">admin@kirkira.com</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Settings size={14} /> Settings
              </button>
              <hr className="my-1 border-gray-100" />
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
