import * as React from "react"
import { cn } from "@/lib/utils"

const Image = React.forwardRef(({ className, src, alt, ...props }, ref) => {
    return (
        <img
            ref={ref}
            src={src}
            alt={alt}
            className={cn("tw-block tw-w-full tw-h-auto", className)}
            {...props}
        />
    )
})
Image.displayName = "Image"

export { Image }
