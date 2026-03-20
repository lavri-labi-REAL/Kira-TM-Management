import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDeadlines, addDeadline, updateDeadline, deleteDeadline } from '../data/mockDeadlines'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export function useDeadlines() {
  return useQuery({
    queryKey: ['deadlines'],
    queryFn: async () => {
      await delay(300)
      return getDeadlines()
    },
  })
}

export function useAddDeadline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      await delay(400)
      return addDeadline(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deadlines'] }),
  })
}

export function useUpdateDeadline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      await delay(300)
      updateDeadline(id, updates)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deadlines'] }),
  })
}

export function useDeleteDeadline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await delay(300)
      deleteDeadline(id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deadlines'] }),
  })
}
