import { TariffPlan, TariffCreate, TariffUpdate } from '@/types/tariff'

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const getTariffs = async (): Promise<TariffPlan[]> => {
  const response = await fetch('/api/v1/tariffs')
  if (!response.ok) throw new Error('Ошибка загрузки тарифов')
  const data = await response.json()
  return data.tariffs
}

export const createTariff = async (tariffData: TariffCreate): Promise<TariffPlan> => {
  const response = await fetch('/api/v1/tariffs', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tariffData)
  })
  if (!response.ok) throw new Error('Ошибка создания тарифа')
  return response.json()
}

export const updateTariff = async (id: string, tariffData: TariffUpdate): Promise<TariffPlan> => {
  const response = await fetch(`/api/v1/tariffs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(tariffData)
  })
  if (!response.ok) throw new Error('Ошибка обновления тарифа')
  return response.json()
}

export const deleteTariff = async (id: string): Promise<void> => {
  const response = await fetch(`/api/v1/tariffs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error('Ошибка удаления тарифа')
}