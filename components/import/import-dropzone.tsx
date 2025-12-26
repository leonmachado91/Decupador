"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Link2, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImportDropzoneProps {
    url: string
    onUrlChange: (url: string) => void
    onImport: () => void
    isLoading: boolean
    error?: string | null
    success?: string | null
}

export function ImportDropzone({
    url,
    onUrlChange,
    onImport,
    isLoading,
    error,
    success,
}: ImportDropzoneProps) {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <div className="w-full max-w-xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                    "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                    isFocused ? "border-primary ring-4 ring-primary/10 bg-background" : "border-border bg-card/50",
                    error ? "border-destructive/50 bg-destructive/5" : "",
                    success ? "border-green-500/50 bg-green-500/5" : ""
                )}
            >
                <div className="p-8 flex flex-col items-center text-center space-y-6">
                    <motion.div
                        animate={{
                            scale: isFocused ? 1.1 : 1,
                            rotate: isLoading ? 360 : 0,
                        }}
                        transition={{
                            scale: { duration: 0.2 },
                            rotate: { duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" },
                        }}
                        className={cn(
                            "h-20 w-20 rounded-full flex items-center justify-center transition-colors duration-300",
                            isFocused ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
                            error ? "bg-destructive/10 text-destructive" : "",
                            success ? "bg-green-500/10 text-green-500" : ""
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-10 w-10" />
                        ) : error ? (
                            <AlertCircle className="h-10 w-10" />
                        ) : success ? (
                            <CheckCircle2 className="h-10 w-10" />
                        ) : (
                            <Link2 className="h-10 w-10" />
                        )}
                    </motion.div>

                    <div className="space-y-2 max-w-md">
                        <h3 className="text-xl font-semibold tracking-tight">
                            {isLoading
                                ? "Processando seu roteiro..."
                                : success
                                    ? "Importação concluída!"
                                    : "Importar do Google Docs"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isLoading
                                ? "Estamos analisando a estrutura e extraindo as cenas."
                                : success
                                    ? "Tudo pronto. Redirecionando..."
                                    : "Cole o link público do seu documento para iniciar a decupagem automática."}
                        </p>
                    </div>

                    <div className="w-full relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                            <FileText className="h-4 w-4" />
                        </div>
                        <Input
                            type="url"
                            value={url}
                            onChange={(e) => onUrlChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={isLoading || !!success}
                            placeholder="https://docs.google.com/document/d/..."
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background transition-all text-base shadow-sm"
                        />
                        <AnimatePresence>
                            {url && !isLoading && !success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute inset-y-1 right-1"
                                >
                                    <Button
                                        size="sm"
                                        onClick={onImport}
                                        className="h-10 px-4 rounded-lg shadow-lg shadow-primary/20"
                                    >
                                        Decupar
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
                </div>
            </motion.div>
        </div>
    )
}
