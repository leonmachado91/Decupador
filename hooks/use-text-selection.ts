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
        let timeoutId: NodeJS.Timeout;

        const onSelectionChange = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                handleSelectionChange();
            }, 150); // 150ms debounce
        };

        document.addEventListener('selectionchange', onSelectionChange);
        window.addEventListener('resize', onSelectionChange);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('selectionchange', onSelectionChange);
            window.removeEventListener('resize', onSelectionChange);
        };
    }, [handleSelectionChange]);

    return selection;
}
