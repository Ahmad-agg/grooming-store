import * as React from "react"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef(
    ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
        <div
            ref={ref}
            role={decorative ? "none" : "separator"}
            aria-orientation={orientation}
            className={cn(
                "tw-shrink-0 tw-bg-border",
                orientation === "horizontal" ? "tw-h-[1px] tw-w-full" : "tw-h-full tw-w-[1px]",
                className
            )}
            {...props}
        />
    )
)
Separator.displayName = "Separator"

export { Separator }
