
// Input.tsx
import React from 'react'
import { cn } from "../../lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helperText?: string
  className?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = "text",
  error,
  label,
  helperText,
  ...props
}, ref) => {
  const id = React.useId()
  
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          "text-sm ring-offset-background focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error ? "text-red-500" : "text-gray-500"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export { Input }
