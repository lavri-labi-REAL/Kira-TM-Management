import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTrademarks, getTrademark, addTrademark, updateTrademark, deleteTrademark
} from '../data/mockTrademarks'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export function useTrademarks() {
  return useQuery({
    queryKey: ['trademarks'],
    queryFn: async () => {
      await delay(300)
      return getTrademarks()
    },
  })
}

export function useTrademark(id) {
  return useQuery({
    queryKey: ['trademarks', id],
    queryFn: async () => {
      await delay(200)
      return getTrademark(id)
    },
    enabled: !!id,
  })
}

export function useAddTrademark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      await delay(400)
      return addTrademark(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trademarks'] }),
  })
}

export function useUpdateTrademark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      await delay(400)
      return updateTrademark(id, updates)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trademarks'] }),
  })
}

export function useDeleteTrademark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await delay(300)
      deleteTrademark(id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trademarks'] }),
  })
}
