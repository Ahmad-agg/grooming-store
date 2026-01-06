import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext({ value: null, onSelect: () => { }, open: false, setOpen: () => { } })

const Select = ({ value, onValueChange, children }) => {
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef(null)

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <SelectContext.Provider value={{ value, onSelect: (val) => { onValueChange(val); setOpen(false); }, open, setOpen }}>
            <div className="tw-relative" ref={ref}>
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = ({ className, children }) => {
    const { open, setOpen } = React.useContext(SelectContext)
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "tw-flex tw-h-10 tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-ring focus:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50",
                className
            )}
        >
            {children}
            <ChevronDown className="tw-h-4 tw-w-4 tw-opacity-50" />
        </button>
    )
}

const SelectValue = ({ placeholder }) => {
    const { value } = React.useContext(SelectContext)
    return <span className="tw-block tw-truncate">{value || placeholder}</span>
}

const SelectContent = ({ className, children }) => {
    const { open } = React.useContext(SelectContext)
    if (!open) return null
    return (
        <div className={cn(
            "tw-absolute tw-z-50 tw-min-w-[8rem] tw-overflow-hidden tw-rounded-md tw-border tw-bg-popover tw-text-popover-foreground tw-shadow-md tw-animate-in tw-fade-in-80 tw-mt-1 tw-w-full tw-bg-white",
            className
        )}>
            <div className="tw-p-1">
                {children}
            </div>
        </div>
    )
}

const SelectItem = ({ className, children, value, ...props }) => {
    const { onSelect, value: selectedValue } = React.useContext(SelectContext)
    return (
        <div
            className={cn(
                "tw-relative tw-flex tw-w-full tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-py-1.5 tw-pl-8 tw-pr-2 tw-text-sm tw-outline-none focus:tw-bg-accent focus:tw-text-accent-foreground data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50 hover:tw-bg-gray-100 tw-cursor-pointer",
                selectedValue === value && "tw-font-semibold tw-bg-gray-50",
                className
            )}
            onClick={() => onSelect(value)}
            {...props}
        >
            {selectedValue === value && (
                <span className="tw-absolute tw-left-2 tw-flex tw-h-3.5 tw-w-3.5 tw-items-center tw-justify-center">
                    <Check className="tw-h-4 tw-w-4" />
                </span>
            )}
            <span className="tw-truncate">{children}</span>
        </div>
    )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
