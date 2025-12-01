import { useState, useEffect, useCallback } from 'react';

interface SelectionState {
    text: string;
    range: Range | null;
    rect: DOMRect | null;
    isCollapsed: boolean;
}

export function useTextSelection() {
    const [selection, setSelection] = useState<SelectionState>({
        text: '',
        range: null,
        rect: null,
        isCollapsed: true,
    });

    const handleSelectionChange = useCallback(() => {
        const activeSelection = window.getSelection();

        if (!activeSelection || activeSelection.isCollapsed) {
            setSelection({
                text: '',
                range: null,
                rect: null,
                isCollapsed: true,
            });
            return;
        }

        const range = activeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const text = activeSelection.toString().trim();

        if (text) {
            setSelection({
                text,
                range,
                rect,
                isCollapsed: false,
            });
        } else {
            setSelection({
                text: '',
                range: null,
                rect: null,
                isCollapsed: true,
            });
        }
    }, []);

    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        // Handle scroll and resize to update position if needed, though selectionchange usually covers it
        window.addEventListener('resize', handleSelectionChange);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            window.removeEventListener('resize', handleSelectionChange);
        };
    }, [handleSelectionChange]);

    return selection;
}
