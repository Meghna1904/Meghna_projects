import * as React from "react"
import { Dialog as DialogPrimitive } from "@headlessui/react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

const Dialog = ({
  open,
  onClose,
  title,
  children,
  className
}: DialogProps) => {
  return (
    <DialogPrimitive
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPrimitive.Panel
          className={cn(
            "w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all",
            className
          )}
        >
          <div className="flex items-center justify-between mb-4">
            {title && (
              <DialogPrimitive.Title className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </DialogPrimitive.Title>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2">
            {children}
          </div>
        </DialogPrimitive.Panel>
      </div>
    </DialogPrimitive>
  )
}

Dialog.displayName = "Dialog"

export { Dialog }