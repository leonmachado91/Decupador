import { Scene } from './stores/documentStore';

export const sortScenes = (scenes: Scene[], sortCriteria: string | null): Scene[] => {
  const sortedScenes = [...scenes]; // Criar uma cópia para não modificar o array original

  if (!sortCriteria) {
    // Ordenação padrão por posição se nenhum critério for fornecido
    return sortedScenes.sort((a, b) => a.position - b.position);
  }

  sortedScenes.sort((a, b) => {
    let fieldA: string;
    let fieldB: string;
    let order = 1; // 1 para ascendente, -1 para descendente

    if (sortCriteria.startsWith('narrativeText')) {
      fieldA = a.narrativeText || '';
      fieldB = b.narrativeText || '';
      if (sortCriteria === 'narrativeText_desc') {
        order = -1;
      }
    } else if (sortCriteria.startsWith('rawComment')) {
      fieldA = a.rawComment || '';
      fieldB = b.rawComment || '';
      if (sortCriteria === 'rawComment_desc') {
        order = -1;
      }
    } else {
      return 0; // Critério de ordenação desconhecido, manter a ordem original
    }

    // Comparação de strings case-insensitive
    const comparison = fieldA.localeCompare(fieldB, undefined, { sensitivity: 'base' });

    return comparison * order;
  });

  return sortedScenes;
};