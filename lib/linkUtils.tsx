import React from 'react';

export const linkify = (text: string): React.ReactNode[] => {
    if (typeof text !== 'string') {
        return [text];
    }
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const matches = [...text.matchAll(urlRegex)];
    
    if (matches.length === 0) {
        return [text];
    }

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
        const url = match[0];
        const index = match.index!;

        // Add the text before the link
        if (index > lastIndex) {
            result.push(text.substring(lastIndex, index));
        }

        // Add the link
        result.push(
            <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
            >
                {url}
            </a>
        );

        lastIndex = index + url.length;
    });

    // Add the remaining text after the last link
    if (lastIndex < text.length) {
        result.push(text.substring(lastIndex));
    }

    return result;
};
