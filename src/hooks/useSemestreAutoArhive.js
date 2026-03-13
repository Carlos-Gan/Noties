import { useState, useEffect } from "react";

export function useSemestreAutoArchive({ vaultListo, cargarMaterias }) {
  const [materiasArchivadas, setMateriasArchivadas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (!vaultListo) return;
    verificarSemestre();
  }, [vaultListo]);

  const verificarSemestre = async () => {
    try {
      // Leer config del semestre
      const fechaFin = await window.electronAPI.invoke("config:get", "semestre_fecha_fin");
      const duracionMeses = await window.electronAPI.invoke("config:get", "semestre_duracion_meses");
      const fechaInicio = await window.electronAPI.invoke("config:get", "semestre_fecha_inicio");
      const yaArchivo = await window.electronAPI.invoke("config:get", "semestre_ya_archivo");

      if (yaArchivo === "true") return; // Ya se archivó este ciclo

      const hoy = new Date();
      let deberiArchivar = false;

      // Verificar por fecha exacta
      if (fechaFin) {
        const fin = new Date(fechaFin);
        if (hoy >= fin) deberiArchivar = true;
      }

      // Verificar por duración en meses
      if (!deberiArchivar && duracionMeses && fechaInicio) {
        const inicio = new Date(fechaInicio);
        const finCalculado = new Date(inicio);
        finCalculado.setMonth(finCalculado.getMonth() + parseInt(duracionMeses));
        if (hoy >= finCalculado) deberiArchivar = true;
      }

      if (!deberiArchivar) return;

      // Obtener materias activas y archivarlas
      const materias = await window.electron.invoke("materias:getAll");
      const activas = materias.filter((m) => !m.archivada);

      if (activas.length === 0) return;

      // Archivar cada materia
      for (const m of activas) {
        await window.electron.invoke("materias:toggleArchivada", m.id);
      }

      // Marcar que ya se archivó para no repetir
      await window.electron.invoke("config:set", "semestre_ya_archivo", "true");

      setMateriasArchivadas(activas);
      setMostrarModal(true);
      cargarMaterias();
    } catch (err) {
      console.error("Error verificando semestre:", err);
    }
  };

  const cerrarModal = () => setMostrarModal(false);

  return { mostrarModal, materiasArchivadas, cerrarModal };
}