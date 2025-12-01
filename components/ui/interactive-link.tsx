import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getLinkPreview } from '@/lib/urlUtils'; // Importar a função getLinkPreview

interface InteractiveLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const InteractiveLink: React.FC<InteractiveLinkProps> = ({ href, children, className }) => {
  const { toast } = useToast();
  const [metadata, setMetadata] = useState<{ title: string | null; image: string | null; loading: boolean }>({
    title: null,
    image: null,
    loading: false
  });

  const [isHovered, setIsHovered] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch metadata on hover or focus to save resources, or on mount if preferred.
  // Here we fetch on mount for simplicity as per previous behavior, but we could optimize.
  useEffect(() => {
    let isMounted = true;

    const fetchMeta = async () => {
      if (!href || !isHovered || hasFetched) return;

      setMetadata(prev => ({ ...prev, loading: true }));
      try {
        // Import dynamically to avoid server-only module errors in client component if not handled by Next.js automatically
        // But since it's a server action imported in a client component, Next.js handles the bridge.
        const { getMetadata } = await import('@/app/actions/get-metadata');
        const data = await getMetadata(href);

        if (isMounted) {
          setMetadata({
            title: data.title,
            image: data.image,
            loading: false
          });
          setHasFetched(true);
        }
      } catch (error) {
        console.error("Failed to fetch metadata", error);
        if (isMounted) {
          setMetadata(prev => ({ ...prev, loading: false }));
          setHasFetched(true); // Avoid infinite retries on hover
        }
      }
    };

    fetchMeta();

    return () => {
      isMounted = false;
    };
  }, [href, isHovered, hasFetched]);

  const handleCopy = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigating when clicking the copy button
    try {
      await navigator.clipboard.writeText(href);
      toast({
        title: 'Link Copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
    } catch (err) {
      toast({
        title: 'Falha ao Copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <HoverCard onOpenChange={(open) => {
      if (open) setIsHovered(true);
    }}>
      <HoverCardTrigger asChild>
        <span className={cn("inline-flex items-center gap-1 cursor-pointer", className)}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px] inline-block align-bottom">
            {children}
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-4 w-4 ml-0.5"
            aria-label="Copiar link"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden">
        <div className="flex flex-col">
          {metadata.loading ? (
            <div className="h-40 w-full bg-muted animate-pulse flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Carregando preview...</span>
            </div>
          ) : metadata.image ? (
            <div className="relative aspect-video w-full bg-black">
              <img
                src={metadata.image}
                alt={metadata.title || "Link preview"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-full bg-muted flex items-center justify-center p-4">
              <span className="text-muted-foreground text-sm">Sem imagem de preview</span>
            </div>
          )}

          <div className="p-3 bg-card">
            <h4 className="font-semibold text-sm line-clamp-2 mb-1">
              {metadata.title || href}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {href}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export { InteractiveLink };