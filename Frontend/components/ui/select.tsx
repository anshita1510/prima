import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || '')

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
      <div className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            if (child.type === SelectTrigger) {
              return React.cloneElement(child as React.ReactElement<any>, {
                onClick: () => setIsOpen(!isOpen),
                value: selectedValue,
                isOpen
              })
            }
            if (child.type === SelectContent) {
              return isOpen ? React.cloneElement(child as React.ReactElement<any>, {
                onValueChange: handleValueChange,
                onClose: () => setIsOpen(false)
              }) : null
            }
          }
          return child
        })}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value?: string
    isOpen?: boolean
  }
>(({ className, children, value, isOpen, style, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    style={{
      backgroundColor: 'var(--input-bg)',
      borderColor: 'var(--card-border)',
      color: 'var(--text-color)',
      ...style,
    }}
    {...props}
  >
    <span>{children}</span>
    <svg
      className={cn("h-4 w-4 transition-transform flex-shrink-0", isOpen && "rotate-180")}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext)
  return <span className={cn(!value && "text-muted-foreground")}>{value || placeholder}</span>
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onValueChange?: (value: string) => void
    onClose?: () => void
  }
>(({ className, children, onValueChange, onClose, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 mt-1 w-full rounded-md border p-1 shadow-md animate-in fade-in-0 zoom-in-95",
      className
    )}
    style={{
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--card-border)',
      color: 'var(--text-color)',
      boxShadow: 'var(--shadow-md)',
      ...style,
    }}
    {...props}
  >
    {React.Children.map(children, child => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        const childElement = child as React.ReactElement<any>
        return React.cloneElement(childElement, {
          onClick: () => {
            onValueChange?.(childElement.props.value)
            onClose?.()
          }
        })
      }
      return child
    })}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-3 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    style={{ color: 'var(--text-color)' }}
    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}