import { useForm, Controller } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { NICE_CLASSES, JURISDICTIONS, MARK_TYPES, STATUSES } from '../../data/mockTrademarks'

export function TrademarkForm({ defaultValues, onSubmit, onCancel, isLoading }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({ defaultValues })
  const [selectedClasses, setSelectedClasses] = useState(defaultValues?.niceClasses || [])

  const toggleClass = (val) => {
    setSelectedClasses(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    )
  }

  const onFormSubmit = (data) => {
    onSubmit({ ...data, niceClasses: selectedClasses })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Mark Name */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Mark Name *</label>
        <input
          {...register('markName', { required: 'Mark name is required' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]"
          placeholder="e.g. Kirkira"
        />
        {errors.markName && <p className="text-xs text-red-500 mt-1">{errors.markName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Mark Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Mark Type</label>
          <select {...register('markType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
            {MARK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select {...register('status')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Jurisdiction */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Jurisdiction</label>
        <select {...register('jurisdiction')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]">
          <option value="">Select jurisdiction...</option>
          {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>

      {/* Nice Classes */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nice Classes</label>
        <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1">
            {NICE_CLASSES.map(nc => (
              <label key={nc.value} className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded p-1">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(nc.value)}
                  onChange={() => toggleClass(nc.value)}
                  className="accent-[#ffa600]"
                />
                <span className="text-xs text-gray-700">Class {nc.value}</span>
              </label>
            ))}
          </div>
        </div>
        {selectedClasses.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">Selected: {selectedClasses.sort((a,b)=>a-b).join(', ')}</p>
        )}
      </div>

      {/* Owner */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Owner</label>
        <input
          {...register('owner')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]"
          placeholder="e.g. Kirkira Holdings Ltd."
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filing Date</label>
          <input type="date" {...register('filingDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Publication Date</label>
          <input type="date" {...register('publicationDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Registration Date</label>
          <input type="date" {...register('registrationDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Renewal Date</label>
          <input type="date" {...register('renewalDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]" />
        </div>
      </div>

      {/* Application Number */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Application Number</label>
        <input
          {...register('applicationNumber')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]"
          placeholder="e.g. US-2024-0101-XXX"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600] resize-none"
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Trademark'}
        </Button>
      </div>
    </form>
  )
}
