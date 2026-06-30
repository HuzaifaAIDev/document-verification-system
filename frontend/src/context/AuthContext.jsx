import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    if (!localStorage.getItem('dvs.access')) { setUser(null); setLoading(false); return }
    try { setUser(await authService.me()) } catch { setUser(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refreshMe() }, [refreshMe])

  const login = async (email, password, remember = false) => {
    const tok = await authService.login(email, password, remember)
    localStorage.setItem('dvs.access', tok.access_token)
    localStorage.setItem('dvs.refresh', tok.refresh_token)
    const me = await authService.me()
    setUser(me)
    return me
  }

  const logout = async () => {
    try { await authService.logout(localStorage.getItem('dvs.refresh')) } catch {}
    localStorage.removeItem('dvs.access')
    localStorage.removeItem('dvs.refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshMe, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
