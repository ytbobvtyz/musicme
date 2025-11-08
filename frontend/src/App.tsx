import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import OrderPage from './pages/OrderPage'
import OrdersPage from './pages/OrdersPage'
import TrackPage from './pages/TrackPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/tracks/:trackId" element={<TrackPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

