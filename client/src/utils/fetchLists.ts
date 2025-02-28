import { trpc } from '@/trpc'

export const fetchLists = async (boardId: number) => {
  try {
    const { lists } = await trpc.board.fetchData.query({ boardId })
    return lists
  } catch (error) {
    console.error('Error fetching aggregated board data:', error)
    return []
  }
}
