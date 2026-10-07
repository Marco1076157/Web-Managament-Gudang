import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer = null,
  size = 'md', 
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true 
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      document.body.style.overflow = 'hidden'
      modalRef.current?.focus()
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && closeOnEscape) {
          onClose()
        }
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElements?.length) {
            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop: z-0, hanya gelap + blur. */}
      <div
        className="absolute inset-0 z-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Layer scroll + panel: z-10 AGAR PANEL DI ATAS backdrop.
          Dulu panel berada di wrapper `static`, sehingga backdrop `fixed`
          menutupinya (layar jadi blur/putih & form tak bisa diklik). */}
      <div
        onClick={(e) => {
          if (closeOnOverlayClick && e.target === e.currentTarget) onClose()
        }}
        className="relative z-10 flex min-h-full justify-center overflow-y-auto p-4"
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={`m-auto flex max-h-[85vh] w-full flex-col ${sizes[size]} bg-white rounded-3xl border border-slate-200 shadow-2xl`}
        >
          {(title || showCloseButton) && (
            <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-slate-200">
              {title && (
                <h2 id="modal-title" className="text-xl font-bold text-slate-900">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* Body: satu-satunya yang scroll, jadi field panjang tidak pernah
              mendorong tombol submit keluar layar. */}
          <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer di LUAR area scroll, selalu menempel di bawah. */}
          {footer && (
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white p-4 rounded-b-3xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default Modal