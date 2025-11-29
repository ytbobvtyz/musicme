// src/api/tariffs.ts
import apiClient from './client'
import { TariffPlan, TariffCreate, TariffUpdate } from '@/types/tariff'

export const getTariffs = async (): Promise<TariffPlan[]> => {
  const response = await apiClient.get('/tariffs')
  return response.data.tariffs || response.data
}

export const createTariff = async (tariffData: TariffCreate): Promise<TariffPlan> => {
  const response = await apiClient.post('/tariffs', tariffData)
  return response.data
}

export const updateTariff = async (id: string, tariffData: TariffUpdate): Promise<TariffPlan> => {
  const response = await apiClient.put(`/tariffs/${id}`, tariffData)
  return response.data
}

export const deleteTariff = async (id: string): Promise<void> => {
  await apiClient.delete(`/tariffs/${id}`)
}