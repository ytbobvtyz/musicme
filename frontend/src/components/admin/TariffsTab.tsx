import { useState, useEffect } from 'react'
import { TariffPlan } from '@/types/tariff'
import { getTariffs, createTariff, updateTariff, deleteTariff } from '@/api/tariffs'
import TariffForm from './TariffForm'
import TariffList from './TariffList'

const TariffsTab = () => {
  const [tariffs, setTariffs] = useState<TariffPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTariff, setEditingTariff] = useState<TariffPlan | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadTariffs()
  }, [])

  const loadTariffs = async () => {
    try {
      setLoading(true)
      const data = await getTariffs()
      setTariffs(data)
    } catch (error) {
      console.error('Ошибка загрузки тарифов:', error)
      alert('Не удалось загрузить тарифы')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (tariffData: any) => {
    try {
      await createTariff(tariffData)
      await loadTariffs()
      setShowForm(false)
    } catch (error) {
      console.error('Ошибка создания тарифа:', error)
      alert('Не удалось создать тариф')
    }
  }

  const handleUpdate = async (id: string, tariffData: any) => {
    try {
      await updateTariff(id, tariffData)
      await loadTariffs()
      setEditingTariff(null)
    } catch (error) {
      console.error('Ошибка обновления тарифа:', error)
      alert('Не удалось обновить тариф')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот тариф?')) return
    
    try {
      await deleteTariff(id)
      await loadTariffs()
    } catch (error) {
      console.error('Ошибка удаления тарифа:', error)
      alert('Не удалось удалить тариф')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка тарифов...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Управление тарифами</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Добавить тариф
        </button>
      </div>

      {showForm && (
        <TariffForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTariff && (
        <TariffForm
          tariff={editingTariff}
          onSubmit={(data) => handleUpdate(editingTariff.id, data)}
          onCancel={() => setEditingTariff(null)}
        />
      )}

      <TariffList
        tariffs={tariffs}
        onEdit={setEditingTariff}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default TariffsTab