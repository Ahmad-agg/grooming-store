import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext({})

const Tabs = React.forwardRef(({ className, defaultValue, children, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue)
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div ref={ref} className={cn("", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "tw-inline-flex tw-h-10 tw-items-center tw-justify-center tw-rounded-md tw-bg-muted tw-p-1 tw-text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
    const { activeTab, setActiveTab } = React.useContext(TabsContext)
    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-rounded-md tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-transition-all focus-visible:tw-outline-none disabled:tw-pointer-events-none disabled:tw-opacity-50",
                activeTab === value
                    ? "tw-bg-black tw-text-white tw-shadow-sm"
                    : "tw-text-muted-foreground hover:tw-text-foreground",
                className
            )}
            onClick={() => setActiveTab(value)}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
    const { activeTab } = React.useContext(TabsContext)
    if (activeTab !== value) return null
    return (
        <div
            ref={ref}
            className={cn(
                "tw-mt-2 tw-ring-offset-background focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2",
                className
            )}
            {...props}
        />
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
