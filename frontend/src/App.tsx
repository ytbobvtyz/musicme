import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import OrderPage from './pages/OrderPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import TrackPage from './pages/TrackPage'
import { useAuthStore } from './store/authStore'

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
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
