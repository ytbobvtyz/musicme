
import AdminLayout from '@/components/admin/AdminLayout'
import { useState } from 'react'
import OrdersTab from '@/components/admin/OrdersTab'
import TracksTab from '@/components/admin/TracksTab'
import ExamplesTab from '@/components/admin/ExamplesTab'
import StatsTab from '@/components/admin/StatsTab'
import TariffsTab from '@/components/admin/TariffsTab'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Табы */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'orders', name: 'Заказы' },
              { id: 'tracks', name: 'Треки' },
              { id: 'examples', name: 'Примеры' },
              { id: 'tariffs', name: 'Тарифы' },
              { id: 'stats', name: 'Статистика' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Контент табов */}
        <div className="mt-6">
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'tracks' && <TracksTab />}
          {activeTab === 'examples' && <ExamplesTab />}
          {activeTab === 'tariffs' && <TariffsTab />}
          {activeTab === 'stats' && <StatsTab />}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminPage