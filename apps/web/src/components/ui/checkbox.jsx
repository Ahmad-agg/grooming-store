import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => onCheckedChange?.(!checked)}
            ref={ref}
            className={cn(
                "tw-peer tw-h-4 tw-w-4 tw-shrink-0 tw-rounded-sm tw-border tw-border-primary tw-ring-offset-background focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50 data-[state=checked]:tw-bg-primary data-[state=checked]:tw-text-primary-foreground",
                checked ? "tw-bg-primary tw-text-primary-foreground" : "tw-bg-transparent",
                className
            )}
            {...props}
        >
            <span className={cn("tw-flex tw-items-center tw-justify-center text-current", checked ? "" : "tw-hidden")}>
                <Check className="tw-h-3 tw-w-3" />
            </span>
        </button>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
