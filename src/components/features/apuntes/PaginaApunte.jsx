import { useState, useEffect, useCallback } from 'react'
import EditorApunte from './EditorApunte'

export default function PaginaApunte({ apunteId }) {
  const [apunte, setApunte] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (!apunteId) return
    ipcRenderer.invoke('apuntes:getOne', apunteId).then(data => {
      setApunte({
        ...data,
        contenido: data.contenido ? JSON.parse(data.contenido) : null
      })
    })
  }, [apunteId])

  // Guardado automático — espera 1.5s después del último cambio
  const handleCambio = useCallback((nuevoContenido) => {
    setApunte(prev => ({ ...prev, contenido: nuevoContenido }))

    if (timer) clearTimeout(timer)
    setGuardando(true)

    const nuevoTimer = setTimeout(async () => {
      await window.electron.invoke('apuntes:guardar', {
        id: apunteId,
        titulo: apunte?.titulo,
        contenido: nuevoContenido,
      })
      setGuardando(false)
    }, 1500)

    setTimer(nuevoTimer)
  }, [apunteId, apunte?.titulo, timer])

  if (!apunte) return (
    <div className="flex items-center justify-center h-full text-white/30">
      Cargando apunte...
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <input
          value={apunte.titulo}
          onChange={e => setApunte(prev => ({ ...prev, titulo: e.target.value }))}
          onBlur={() => window.electron.invoke('apuntes:guardar', {
            id: apunteId,
            titulo: apunte.titulo,
            contenido: apunte.contenido,
          })}
          className="bg-transparent text-white text-xl font-semibold focus:outline-none w-full"
          placeholder="Sin título"
        />
        <span className="text-white/30 text-xs ml-4 shrink-0">
          {guardando ? 'Guardando...' : 'Guardado'}
        </span>
      </div>

      {/* Editor */}
      <EditorApunte
        contenido={apunte.contenido}
        onChange={handleCambio}
      />
    </div>
  )
}