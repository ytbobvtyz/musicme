import { create } from 'zustand'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

// Функция для декодирования JWT токена
const decodeJWT = (token: string): { 
  sub: string; 
  email?: string; 
  name?: string;
  created_at?: string;
} => {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return { sub: 'unknown' }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  
  setToken: (token: string) => {
    localStorage.setItem('token', token)
    
    // Декодируем JWT чтобы получить данные пользователя
    const decoded = decodeJWT(token)
    
    const user: User = {
      id: decoded.sub,
      email: decoded.email || 'user@example.com',
      name: decoded.name || 'Пользователь',
      // avatar_url пока не используем, т.к. его нет в JWT
      created_at: decoded.created_at || new Date().toISOString()
    }
    
    set({ 
      token, 
      user,
      isAuthenticated: true 
    })
    
    console.log('User authenticated:', user)
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('pendingOrder') // ← добавляем очистку заказа
    set({ user: null, token: null, isAuthenticated: false })
  },
}))