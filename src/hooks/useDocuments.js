import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDocuments, getDocumentsForTrademark, getTimelineForTrademark,
  addDocument, deleteDocument, addTimelineEvent
} from '../data/mockDocuments'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      await delay(300)
      return getDocuments().documents
    },
  })
}

export function useTrademarkDocuments(trademarkId) {
  return useQuery({
    queryKey: ['documents', trademarkId],
    queryFn: async () => {
      await delay(200)
      return getDocumentsForTrademark(trademarkId)
    },
    enabled: !!trademarkId,
  })
}

export function useTimeline(trademarkId) {
  return useQuery({
    queryKey: ['timeline', trademarkId],
    queryFn: async () => {
      await delay(200)
      return getTimelineForTrademark(trademarkId)
    },
    enabled: !!trademarkId,
  })
}

export function useAddDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (doc) => {
      await delay(1500) // simulate OCR
      return addDocument(doc)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await delay(300)
      deleteDocument(id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useAddTimelineEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (event) => {
      await delay(400)
      return addTimelineEvent(event)
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['timeline', vars.trademarkId] }),
  })
}
