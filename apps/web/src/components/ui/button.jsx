import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-normal tw-transition-colors tw-focus-visible:outline-none tw-focus-visible:ring-1 tw-focus-visible:ring-ring tw-disabled:pointer-events-none tw-disabled:opacity-50 [&_svg]:tw-pointer-events-none [&_svg]:tw-size-4 [&_svg]:tw-shrink-0",
    {
        variants: {
            variant: {
                default:
                    "tw-bg-primary tw-text-primary-foreground tw-shadow hover:tw-bg-primary/90",
                destructive:
                    "tw-bg-destructive tw-text-destructive-foreground tw-shadow-sm hover:tw-bg-destructive/90",
                outline:
                    "tw-border tw-border-primary/20 tw-text-primary tw-bg-transparent tw-shadow-sm hover:tw-bg-primary/10 hover:tw-border-primary/80",
                secondary:
                    "tw-bg-secondary tw-text-secondary-foreground tw-shadow-sm hover:tw-bg-secondary/80",
                ghost: "tw-bg-transparent tw-text-foreground hover:tw-bg-secondary/10 hover:tw-text-foreground",
                link: "tw-text-primary tw-underline-offset-4 hover:tw-underline",
            },
            size: {
                default: "tw-h-9 tw-px-4 tw-py-2",
                sm: "tw-h-8 tw-rounded-md tw-px-3 tw-text-xs",
                lg: "tw-h-10 tw-rounded-md tw-px-8",
                icon: "tw-h-9 tw-w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
