import { unparse } from 'papaparse';
import type { Scene } from './stores/documentStore';

/**
 * Prepara os dados das cenas para exportação CSV.
 * @param scenes Array de cenas a serem exportadas.
 * @returns Array de objetos formatados para o CSV.
 */
const prepareDataForCsv = (scenes: Scene[]) => {
  return scenes.map(scene => ({
    'Trecho Narrado': scene.narrativeText,
    'Comentário Bruto': scene.rawComment,
    'Status': scene.status,
    'Notas do Editor': scene.editorNotes,
    'Link / Asset': scene.assets.map(asset => asset.value).join(', '),
  }));
};

/**
 * Exporta um array de cenas para um arquivo CSV.
 * @param scenes Array de cenas a serem exportadas.
 * @param filename Nome do arquivo CSV a ser gerado.
 */
export const exportToCsv = (scenes: Scene[], filename: string) => {
  if (!scenes || scenes.length === 0) {
    console.warn('Nenhum dado para exportar.');
    // Retornar um valor para indicar que nada foi feito
    return false;
  }

  try {
    const formattedData = prepareDataForCsv(scenes);
    const csv = unparse(formattedData);

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }); // Adiciona BOM para Excel
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Limpeza
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return true;

  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    return false;
  }
};
