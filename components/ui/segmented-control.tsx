"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SegmentedControlProps {
    options: {
        value: string
        label: string
        icon?: React.ReactNode
    }[]
    value: string
    onChange: (value: string) => void
    className?: string
}

export function SegmentedControl({
    options,
    value,
    onChange,
    className,
}: SegmentedControlProps) {
    return (
        <div
            className={cn(
                "flex p-1 bg-secondary rounded-lg relative isolate",
                className
            )}
        >
            {options.map((option) => {
                const isActive = value === option.value
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="segmented-control-active"
                                className="absolute inset-0 bg-background rounded-md shadow-sm border border-border/50 -z-10"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            />
                        )}
                        {option.icon && <span className="w-4 h-4">{option.icon}</span>}
                        <span>{option.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
