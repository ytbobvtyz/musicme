import { TariffPlan } from '@/types/tariff'
import { formatPrice } from '@/utils/format'

interface TariffListProps {
  tariffs: TariffPlan[]
  onEdit: (tariff: TariffPlan) => void
  onDelete: (id: string) => void
}

const TariffList = ({ tariffs, onEdit, onDelete }: TariffListProps) => {
  if (tariffs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Тарифы не найдены
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {tariffs.map((tariff) => (
          <li key={tariff.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${tariff.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h4 className="text-lg font-medium text-gray-900">
                        {tariff.name}
                      </h4>
                      {tariff.popular && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {tariff.badge || 'Популярный'}
                        </span>
                      )}
                      {tariff.badge && !tariff.popular && (
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {tariff.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{tariff.description}</p>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="mr-4">
                        💰 {formatPrice(tariff.price)}
                        {tariff.original_price && (
                          <span className="ml-1 text-gray-400 line-through">
                            {formatPrice(tariff.original_price)}
                          </span>
                        )}
                      </span>
                      <span className="mr-4">⏱️ {tariff.deadline_days} дн.</span>
                      <span className="mr-4">🔄 {tariff.rounds} правок</span>
                      {tariff.has_questionnaire && <span className="mr-2">📝 Анкета</span>}
                      {tariff.has_interview && <span className="mr-2">🎥 Интервью</span>}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Особенности: {tariff.features.slice(0, 3).join(', ')}
                        {tariff.features.length > 3 && '...'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(tariff)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => onDelete(tariff.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TariffList