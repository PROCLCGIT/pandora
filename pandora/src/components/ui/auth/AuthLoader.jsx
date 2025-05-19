import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../../modulos/auth/authContext'
import AuthErrorPage from './AuthErrorPage'

/**
 * Componente que muestra un loader durante la carga inicial de autenticación
 * Evita que se muestre contenido no autenticado brevemente antes de redireccionar
 */
function AuthLoader({ children }) {
  const { isLoading, isAuthenticated, error, checkAuthStatus } = useAuth()
  const [showContent, setShowContent] = useState(false)
  const [loadingCycles, setLoadingCycles] = useState(0)
  const [authError, setAuthError] = useState(false)
  const maxLoadingTime = useRef(false)
  
  // Contador de ciclos para detectar posibles bucles infinitos
  useEffect(() => {
    if (isLoading) {
      setLoadingCycles(prev => prev + 1)
    }
  }, [isLoading])
  
  // Efecto para detectar errores persistentes de autenticación
  useEffect(() => {
    if (error && !isLoading && loadingCycles > 2) {
      setAuthError(true)
    }
  }, [error, isLoading, loadingCycles])
  
  // Efecto para establecer un tiempo máximo de carga
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showContent) {
        console.log('Tiempo máximo de carga alcanzado, mostrando contenido forzadamente')
        maxLoadingTime.current = true
        setShowContent(true)
      }
    }, 5000) // Máximo 5 segundos de carga
    
    return () => clearTimeout(timer)
  }, [])
  
  // Efecto para controlar cuándo mostrar el contenido con estabilización
  useEffect(() => {
    let timer;
    
    // Si ya no está cargando o hemos excedido ciclos, mostrar contenido
    if ((!isLoading && (isAuthenticated || error)) || loadingCycles > 5 || maxLoadingTime.current) {
      // Retraso más largo para asegurar que el estado se ha estabilizado completamente
      timer = setTimeout(() => {
        setShowContent(true)
      }, 500) // Aumentado a 500ms para mejor estabilidad
    } else if (isLoading && loadingCycles <= 5) {
      // Solo ocultamos si no hemos excedido el máximo de ciclos
      timer = setTimeout(() => {
        setShowContent(false)
      }, 200) // Pequeño retraso para evitar parpadeos al ocultar
    }
    
    return () => clearTimeout(timer)
  }, [isLoading, isAuthenticated, error, loadingCycles])
  
  // Handler para reintentar autenticación
  const handleRetryAuth = () => {
    setAuthError(false)
    setLoadingCycles(0)
    maxLoadingTime.current = false
    setShowContent(false)
    checkAuthStatus(true) // Forzar nueva verificación
  }
  
  // Mientras se carga la autenticación, mostrar spinner (siempre que no hayamos excedido ciclos)
  if ((isLoading || !showContent) && loadingCycles <= 5 && !maxLoadingTime.current) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-700">Verificando autenticación...</p>
          {loadingCycles > 3 && (
            <p className="mt-1 text-sm text-gray-500">
              Esto está tomando más tiempo de lo normal...
            </p>
          )}
        </div>
      </div>
    )
  }
  
  // Si hay un error persistente de autenticación, mostrar página de error
  if (authError && error && !isAuthenticated) {
    return <AuthErrorPage error={error} onRetry={handleRetryAuth} />
  }
  
  // Cuando ya se ha estabilizado el estado de autenticación o se ha excedido el tiempo, mostrar contenido
  return children
}

export default AuthLoader 