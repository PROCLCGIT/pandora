import { useState, useEffect } from 'react'
import { checkBackendConnection } from '../../utils/auth'

function ConnectionStatus() {
  const [status, setStatus] = useState({
    checking: true,
    connected: false,
    message: 'Verificando conexión con el servidor...',
    details: null
  })

  useEffect(() => {
    let mounted = true
    let retryTimeout

    const checkConnection = async () => {
      if (!mounted) return
      
      try {
        const result = await checkBackendConnection()
        
        if (mounted) {
          setStatus({
            checking: false,
            connected: result.connected,
            message: result.message,
            details: result.details || null
          })
          
          // Si hay error, programar un reintento
          if (!result.connected) {
            retryTimeout = setTimeout(() => {
              if (mounted) {
                setStatus(prev => ({ ...prev, checking: true }))
                checkConnection()
              }
            }, 10000) // Reintentar cada 10 segundos
          }
        }
      } catch (error) {
        if (mounted) {
          setStatus({
            checking: false,
            connected: false,
            message: 'Error al verificar la conexión',
            details: { error: error.message }
          })
          
          // Programar reintento
          retryTimeout = setTimeout(() => {
            if (mounted) {
              setStatus(prev => ({ ...prev, checking: true }))
              checkConnection()
            }
          }, 10000)
        }
      }
    }
    
    checkConnection()
    
    return () => {
      mounted = false
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [])
  
  // No mostrar nada si está conectado
  if (status.connected) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {status.checking ? (
            <svg className="w-5 h-5 text-amber-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {status.checking ? 'Verificando conexión...' : 'Problema de conexión'}
          </h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{status.message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus 