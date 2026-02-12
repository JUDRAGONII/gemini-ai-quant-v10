"use client"

import * as React from "react"

// Simple class merger
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: number | null }
>(({ className, value, ...props }, ref) => {
    const safeValue = Math.min(Math.max(value || 0, 0), 100);

    return (
        <div
            ref={ref}
            className={classNames(
                "relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
                className
            )}
            {...props}
        >
            <div
                className="h-full w-full flex-1 bg-slate-900 transition-all dark:bg-slate-50"
                style={{ transform: `translateX(-${100 - safeValue}%)` }}
            />
        </div>
    )
})
Progress.displayName = "Progress"

export { Progress }
