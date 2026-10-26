import * as React from "react"
import { cn } from "@/lib/utils"

// Ledger buttons are pills. Primary is ink (paper in dark) and mixes in a little
// brand colour on hover; brand colour is never a flat fill.
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary text-primary-foreground hover:[background:color-mix(in_srgb,hsl(var(--primary))_82%,hsl(var(--kumkum)))]": variant === "default",
                        "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
                        "border-input bg-card text-foreground hover:border-rule": variant === "outline",
                        "bg-secondary text-secondary-foreground hover:bg-hover hover:text-foreground": variant === "secondary",
                        "text-muted-foreground hover:bg-accent hover:text-foreground": variant === "ghost",
                        "text-coral underline-offset-4 hover:text-muted-foreground": variant === "link",
                        "min-h-[44px] px-5 text-[15px]": size === "default",
                        "min-h-[36px] px-4 text-sm": size === "sm",
                        "min-h-[52px] px-[26px] text-base": size === "lg",
                        "h-11 w-11 shrink-0": size === "icon",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
