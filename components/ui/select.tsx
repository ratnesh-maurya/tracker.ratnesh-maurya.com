import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex w-full rounded-full border border-border bg-card px-4 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-150 hover:border-rule focus-visible:border-rule disabled:cursor-not-allowed disabled:opacity-50 h-11",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
        )
    }
)
Select.displayName = "Select"

export { Select }

