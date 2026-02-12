import * as React from "react"

// Simple class merger
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

const ScrollArea = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative overflow-auto custom-scrollbar", className)}
        {...props}
    >
        {children}
        <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.1);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.2);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(148, 163, 184, 0.4);
      }
    `}</style>
    </div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
