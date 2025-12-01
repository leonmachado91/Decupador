import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/csvUtils"
import { Scene } from "@/lib/stores/documentStore"

export function useExportCsv() {
    const { toast } = useToast()

    const handleExport = (scenes: Scene[]) => {
        if (scenes && scenes.length > 0) {
            const success = exportToCsv(scenes, 'decupagem.csv');
            if (success) {
                toast({
                    title: "Exportação Concluída",
                    description: "O arquivo 'decupagem.csv' foi baixado.",
                });
            } else {
                toast({
                    title: "Erro na Exportação",
                    description: "Não foi possível exportar os dados para CSV.",
                    variant: "destructive",
                });
            }
        } else {
            toast({
                title: "Nada para Exportar",
                description: "Não há dados na tabela para serem exportados.",
                variant: "destructive",
            });
        }
    }

    return { handleExport }
}
