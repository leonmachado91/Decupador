import { useEffect, useState, useRef } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, StickyNote, X, Clock, Video, Image as ImageIcon, Link } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface FloatingDecupageMenuProps {
    selectionRect: DOMRect | null;
    selectedText: string;
    onAction: (type: 'scene' | 'note' | 'timecode' | 'video' | 'image' | 'link', text: string) => void;
    onClearSelection: () => void;
}

export function FloatingDecupageMenu({
    selectionRect,
    selectedText,
    onAction,
    onClearSelection
}: FloatingDecupageMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    // We use a virtual element to position the popover
    const virtualRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectionRect && selectedText) {
            setIsOpen(true);
            // Update the position of the virtual element
            if (virtualRef.current) {
                virtualRef.current.style.position = 'fixed';
                virtualRef.current.style.top = `${selectionRect.top}px`;
                virtualRef.current.style.left = `${selectionRect.left}px`;
                virtualRef.current.style.width = `${selectionRect.width}px`;
                virtualRef.current.style.height = `${selectionRect.height}px`;
                // Ensure it's above other content but invisible
                virtualRef.current.style.pointerEvents = 'none';
                virtualRef.current.style.visibility = 'hidden';
            }
        } else {
            setIsOpen(false);
        }
    }, [selectionRect, selectedText]);

    if (!isOpen || !selectionRect) return null;

    return (
        <>
            {/* Anchor element for Popover */}
            <div ref={virtualRef} />

            <Popover open={isOpen} onOpenChange={(open) => !open && onClearSelection()} modal={false}>
                <PopoverTrigger asChild>
                    <div className="fixed" style={{
                        top: selectionRect.top,
                        left: selectionRect.left,
                        width: selectionRect.width,
                        height: selectionRect.height
                    }} />
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-1 shadow-xl border-primary/20 glass-panel"
                    side="top"
                    align="center"
                    onOpenAutoFocus={(e) => e.preventDefault()} // Prevent stealing focus from selection
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="flex gap-1"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 hover:bg-primary/10 hover:text-primary"
                            onClick={() => onAction('scene', selectedText)}
                            title="Nova Cena"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Cena</span>
                        </Button>

                        <div className="w-px h-4 bg-border my-auto mx-1" />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-chart-1/10 hover:text-chart-1"
                            onClick={() => onAction('timecode', selectedText)}
                            title="Timecode"
                        >
                            <Clock className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-chart-2/10 hover:text-chart-2"
                            onClick={() => onAction('video', selectedText)}
                            title="Vídeo"
                        >
                            <Video className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-chart-3/10 hover:text-chart-3"
                            onClick={() => onAction('image', selectedText)}
                            title="Imagem"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-chart-4/10 hover:text-chart-4"
                            onClick={() => onAction('link', selectedText)}
                            title="Link"
                        >
                            <Link className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-4 bg-border my-auto mx-1" />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => onAction('note', selectedText)}
                            title="Nota"
                        >
                            <StickyNote className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-4 bg-border my-auto mx-1" />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClearSelection}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </motion.div>
                </PopoverContent>
            </Popover>
        </>
    );
}
