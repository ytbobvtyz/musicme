import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import OrderPage from './pages/OrderPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import TrackPage from './pages/TrackPage'
import ExamplesPage from './pages/ExamplePage'
import AdminPage from './pages/AdminPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import { useAuthStore } from './store/authStore'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProducerPage from '@/pages/ProducerPage'
import ProducerOrderDetailPage from '@/pages/ProducerOrderDetailPage'

function App() {
  const { setToken } = useAuthStore()

  // Инициализация авторизации при загрузке приложения
  useEffect(() => {
    // 1. Проверяем токен в localStorage
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      console.log('Found token in localStorage:', savedToken)
      setToken(savedToken)
    }

    // 2. Проверяем токен в URL (после OAuth редиректа)
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    
    if (urlToken) {
      console.log('Found token in URL:', urlToken)
      setToken(urlToken)
      
      // Очищаем URL от параметра token
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      console.log('URL cleaned')
    }
  }, [setToken])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/tracks/:trackId" element={<TrackPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/producer" element={<ProducerPage />} />
          <Route path="/producer/orders/:orderId" element={<ProducerOrderDetailPage />} />
          <Route path="/order/success" element={<OrderSuccessPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
