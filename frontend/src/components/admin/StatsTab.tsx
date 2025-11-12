import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

interface StatsData {
  core_metrics?: {
    total_orders: number
    total_revenue: number
    average_order_value: number
    conversion_rate: number
    active_users: number
  }
  order_stats?: {
    orders_by_status: Record<string, number>
    orders_timeline: Array<{ date: string; count: number; revenue: number }>
    average_completion_time: number
  }
  financial_stats?: {
    revenue_by_period: {
      daily: number
      weekly: number
      monthly: number
    }
    revenue_growth: number
    most_profitable_themes: Array<{ theme: string; revenue: number; count: number }>
    most_popular_genres: Array<{ genre: string; count: number }>
  }
  user_stats?: {
    new_users_period: number
    returning_customers: number
  }
}

const StatsTab = () => {
  const { token } = useAuthStore()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/stats?period=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('📊 Stats data received:', data)
        setStats(data)
      } else if (response.status === 401) {
        setError('Ошибка авторизации. Пожалуйста, войдите снова.')
      } else {
        const errorText = await response.text()
        setError(`Ошибка загрузки: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('Ошибка сети при загрузке статистики')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  // Безопасные геттеры для данных
  const getCoreMetrics = () => ({
    total_orders: stats?.core_metrics?.total_orders || 0,
    total_revenue: stats?.core_metrics?.total_revenue || 0,
    average_order_value: stats?.core_metrics?.average_order_value || 0,
    conversion_rate: stats?.core_metrics?.conversion_rate || 0,
    active_users: stats?.core_metrics?.active_users || 0
  })

  const getOrderStats = () => ({
    orders_by_status: stats?.order_stats?.orders_by_status || {},
    orders_timeline: stats?.order_stats?.orders_timeline || [],
    average_completion_time: stats?.order_stats?.average_completion_time || 0
  })

  const getFinancialStats = () => ({
    revenue_by_period: stats?.financial_stats?.revenue_by_period || { daily: 0, weekly: 0, monthly: 0 },
    revenue_growth: stats?.financial_stats?.revenue_growth || 0,
    most_profitable_themes: stats?.financial_stats?.most_profitable_themes || [],
    most_popular_genres: stats?.financial_stats?.most_popular_genres || []
  })

  const getUserStats = () => ({
    new_users_period: stats?.user_stats?.new_users_period || 0,
    returning_customers: stats?.user_stats?.returning_customers || 0
  })

  const coreMetrics = getCoreMetrics()
  const orderStats = getOrderStats()
  const financialStats = getFinancialStats()
  const userStats = getUserStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-medium mb-2">Ошибка загрузки статистики</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Аналитика и статистика</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="week">За неделю</option>
          <option value="month">За месяц</option>
          <option value="quarter">За квартал</option>
        </select>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Всего заказов</h3>
          <p className="text-3xl font-bold text-gray-900">
            {coreMetrics.total_orders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Общая выручка</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(coreMetrics.total_revenue)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Конверсия</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatPercentage(coreMetrics.conversion_rate)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Активные пользователи</h3>
          <p className="text-3xl font-bold text-purple-600">
            {coreMetrics.active_users}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика по статусам заказов */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Заказы по статусам</h3>
          <div className="space-y-3">
            {Object.entries(orderStats.orders_by_status).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize">{status.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{count}</span>
                  {coreMetrics.total_orders > 0 && (
                    <span className="text-sm text-gray-500">
                      ({((count / coreMetrics.total_orders) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Финансовая статистика */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Финансы</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Выручка за день</span>
              <span className="font-medium text-green-600">
                {formatCurrency(financialStats.revenue_by_period.daily)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Выручка за неделю</span>
              <span className="font-medium text-green-600">
                {formatCurrency(financialStats.revenue_by_period.weekly)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Выручка за месяц</span>
              <span className="font-medium text-green-600">
                {formatCurrency(financialStats.revenue_by_period.monthly)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Рост выручки</span>
              <span className={`font-medium ${
                financialStats.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {financialStats.revenue_growth >= 0 ? '+' : ''}
                {formatPercentage(financialStats.revenue_growth)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Популярные темы и жанры */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Самые прибыльные темы */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Самые прибыльные темы</h3>
          <div className="space-y-3">
            {financialStats.most_profitable_themes.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.theme}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formatCurrency(item.revenue)}</span>
                  <span className="text-sm text-gray-500">({item.count} зак.)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Самые популярные жанры */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Самые популярные жанры</h3>
          <div className="space-y-3">
            {financialStats.most_popular_genres.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.genre}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.count}</span>
                  {coreMetrics.total_orders > 0 && (
                    <span className="text-sm text-gray-500">
                      ({((item.count / coreMetrics.total_orders) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Пользовательская статистика */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Пользователи</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {userStats.new_users_period}
            </div>
            <div className="text-sm text-gray-500">Новых пользователей</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(userStats.returning_customers)}
            </div>
            <div className="text-sm text-gray-500">Постоянных клиентов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(orderStats.average_completion_time)}ч
            </div>
            <div className="text-sm text-gray-500">Среднее время выполнения</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsTab