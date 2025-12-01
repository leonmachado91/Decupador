import { useToast } from "@/hooks/use-toast"
import { Scene } from "@/lib/stores/documentStore"

export function useYouTubeLinks() {
    const { toast } = useToast()

    const handleCopyYouTubeLinks = (scenes: Scene[]) => {
        const youtubeRegex = /(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+|https?:\/\/youtu\.be\/[\w-]+)/g
        let allLinks: string[] = []

        scenes.forEach(scene => {
            if (scene.rawComment) {
                const links = scene.rawComment.match(youtubeRegex)
                if (links) {
                    allLinks = [...allLinks, ...links]
                }
            }
        })

        if (allLinks.length > 0) {
            const uniqueLinks = [...new Set(allLinks)]
            navigator.clipboard.writeText(uniqueLinks.join("\n"))
            toast({
                title: "Sucesso!",
                description: `${uniqueLinks.length} link(s) do YouTube foram copiados para a área de transferência.`,
            })
        } else {
            toast({
                title: "Nenhum link encontrado",
                description: "Não foram encontrados links do YouTube nos comentários.",
            })
        }
    }

    return { handleCopyYouTubeLinks }
}
