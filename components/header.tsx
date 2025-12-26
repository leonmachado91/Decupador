"use client"

import { Button } from "@/components/ui/button"
import { FileText, Table, Download, Plus, Sun, Moon, Copy } from "lucide-react"
import { useTheme } from 'next-themes'
import { SegmentedControl } from "@/components/ui/segmented-control"

interface HeaderProps {
    activeView: "script" | "table"
    setActiveView: (view: "script" | "table") => void
    onExport: () => void
    onCopyLinks: () => void
    onNewScript: () => void
}

export function Header({ activeView, setActiveView, onExport, onCopyLinks, onNewScript }: HeaderProps) {
    const { theme, setTheme } = useTheme()

    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Decupador de Roteiro HI
                        </h1>
                    </div>

                    {/* View Toggle */}
                    <SegmentedControl
                        value={activeView}
                        onChange={(v) => setActiveView(v as "script" | "table")}
                        options={[
                            { value: "script", label: "Roteiro", icon: <FileText className="w-4 h-4" /> },
                            { value: "table", label: "Tabela", icon: <Table className="w-4 h-4" /> },
                        ]}
                        className="h-9"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Alternar tema"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="rounded-full hover:bg-secondary transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    <div className="h-4 w-px bg-border/50 mx-1" />

                    <Button
                        variant="ghost"
                        onClick={onExport}
                        className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onCopyLinks}
                        className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <Copy className="h-4 w-4" />
                        Copiar Links
                    </Button>
                    <Button
                        onClick={onNewScript}
                        className="gap-2 btn-glossy bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Roteiro
                    </Button>
                </div>
            </div>
        </header>
    )
}
