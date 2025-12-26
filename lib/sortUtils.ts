import type { Scene, SortCriteria } from './stores/documentStore'

export const sortScenes = (scenes: Scene[], sortCriteria: SortCriteria | null): Scene[] => {
  const sortedScenes = [...scenes]

  if (!sortCriteria) {
    return sortedScenes.sort((a, b) => a.position - b.position)
  }

  sortedScenes.sort((a, b) => {
    let fieldA = ''
    let fieldB = ''
    let order = 1

    if (sortCriteria === 'narrativeText_asc' || sortCriteria === 'narrativeText_desc') {
      fieldA = a.narrativeText || ''
      fieldB = b.narrativeText || ''
      order = sortCriteria === 'narrativeText_desc' ? -1 : 1
    } else if (sortCriteria === 'rawComment_asc' || sortCriteria === 'rawComment_desc') {
      fieldA = a.rawComment || ''
      fieldB = b.rawComment || ''
      order = sortCriteria === 'rawComment_desc' ? -1 : 1
    } else {
      return 0
    }

    const comparison = fieldA.localeCompare(fieldB, undefined, { sensitivity: 'base' })

    return comparison * order
  })

  return sortedScenes
}
