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
import ManualPaymentPage from './pages/ManualPaymentPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'

// СТАТИЧЕСКАЯ семантическая разметка - ОСОЗНАННЫЙ ВЫБОР ДЛЯ MVP
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "MusicMe.ru",
  "description": "Создание уникальных персонализированных песен-подарков на заказ",
  "url": "https://musicme.ru",
  "serviceType": "Музыкальные услуги",
  "provider": {
    "@type": "Organization",
    "name": "MusicMe.ru"
  },
  "areaServed": "RU",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Тарифы на создание песен",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Базовый тариф",
          "description": "Создание персонализированной песни с базовой персонализацией"
        },
        "price": "2900",
        "priceCurrency": "RUB"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Продвинутый тариф",
          "description": "Создание песни с детальной проработкой текста и анкетой"
        },
        "price": "4900",
        "priceCurrency": "RUB"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Премиум тариф", 
          "description": "Создание эксклюзивной песни с видео-интервью и персональным продюсером"
        },
        "price": "9900",
        "priceCurrency": "RUB"
      }
    ]
  }
}

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
      {/* СТАТИЧЕСКАЯ разметка - ДЕЛАЕМ ОСОЗНАННО ДЛЯ БЫСТРОГО СТАРТА */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
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
          <Route path="/orders/:orderId/payment" element={<ManualPaymentPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App