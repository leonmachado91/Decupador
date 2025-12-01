'use server'

interface Metadata {
    title: string | null;
    description: string | null;
    image: string | null;
    url: string;
}

function decodeHtmlEntities(text: string | null): string | null {
    if (!text) return null;
    return text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

function truncate(text: string | null, maxLength: number): string | null {
    if (!text) return null;
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export async function getMetadata(url: string): Promise<Metadata> {
    try {
        if (!url || !url.startsWith('http')) {
            return { title: null, description: null, image: null, url };
        }

        // 1. Check for direct image links
        const imageExtensions = /\.(jpeg|jpg|gif|png|webp|bmp|tiff)$/i;
        if (imageExtensions.test(url)) {
            const filename = url.split('/').pop() || 'Image';
            return {
                title: decodeURIComponent(filename),
                description: 'Direct Image Link',
                image: url,
                url
            };
        }

        // 2. YouTube Handling (oEmbed for title + Regex for thumb)
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
        const ytMatch = url.match(youtubeRegex);
        if (ytMatch && ytMatch[1]) {
            const videoId = ytMatch[1];
            let videoTitle = "YouTube Video";

            try {
                const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
                const oembedRes = await fetch(oembedUrl, { next: { revalidate: 3600 } });
                if (oembedRes.ok) {
                    const oembedData = await oembedRes.json();
                    videoTitle = oembedData.title || videoTitle;
                }
            } catch (e) {
                console.error("Failed to fetch YouTube oEmbed", e);
            }

            return {
                title: videoTitle,
                description: "YouTube Video",
                image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                url
            };
        }

        // 3. General Page Fetch
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            // Fallback for when fetch fails (e.g. 403 Forbidden on some sites)
            // Check if it looks like an image even if extension check failed or if it was a redirect to image
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) {
                const filename = url.split('/').pop() || 'Image';
                return {
                    title: decodeURIComponent(filename),
                    description: 'Image',
                    image: url,
                    url
                };
            }
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        const html = await response.text();

        const getMetaTag = (name: string) => {
            const regex = new RegExp(`<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']+)["']`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        const getTitle = () => {
            const ogTitle = getMetaTag('og:title');
            if (ogTitle) return ogTitle;

            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            return titleMatch ? titleMatch[1] : null;
        };

        let title = decodeHtmlEntities(getTitle());
        let description = decodeHtmlEntities(getMetaTag('og:description') || getMetaTag('description'));
        const image = getMetaTag('og:image');

        // Clean up title and description
        title = truncate(title, 100);
        description = truncate(description, 150);

        return {
            title,
            description,
            image,
            url
        };

    } catch (error) {
        console.error('Error fetching metadata:', error);
        return { title: null, description: null, image: null, url };
    }
}
