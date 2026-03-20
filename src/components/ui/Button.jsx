export function Button({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffa600] disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-[#ffa600] text-white hover:bg-[#C2410C]',
    secondary: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
    danger:    'bg-red-500 text-white hover:bg-red-600',
    ghost:     'text-gray-600 hover:bg-gray-100',
    success:   'bg-green-500 text-white hover:bg-green-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
