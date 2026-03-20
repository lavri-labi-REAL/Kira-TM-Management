import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { AlertTriangle } from 'lucide-react'

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}
