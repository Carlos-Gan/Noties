import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

import HeroSection from "./HeroSection";
import KanbanColumn from "./KanbanColumn";
import ProyectoDetalleModal from "./ProyectoDetalleModal";
import { ESTADOS } from "./constants";
import ModalNuevoProyecto from "../../Modals/ModalNuevoProyecto";

const ProyectoDashboard = ({ materias = [] }) => {
  const [proyectos, setProyectos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [proyectoAEditar, setProyectoAEditar] = useState(null);
  const [detallesOpen, setDetallesOpen] = useState(false);
  const [proyectoEnDetalle, setProyectoEnDetalle] = useState(null);

  const cargarDatos = async () => {
    const data = await window.electronAPI.invoke("proyectos:getAll");
    setProyectos(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const verDetalles = (p) => {
    setProyectoEnDetalle(p);
    setDetallesOpen(true);
  };

  const editarProyecto = (e, p) => {
    e.preventDefault();
    setProyectoAEditar(p);
    setModalOpen(true);
  };

  const handleDragEnd = async (proyectoId, nuevoEstado) => {
    const proyectoActual = proyectos.find((p) => p.id === proyectoId);
    if (!proyectoActual || proyectoActual.estado === nuevoEstado) return;

    const datosActualizados = { ...proyectoActual, estado: nuevoEstado };
    setProyectos((prev) =>
      prev.map((p) => (p.id === proyectoId ? datosActualizados : p)),
    );
    await window.electronAPI.invoke("proyectos:actualizar", datosActualizados);
    cargarDatos();
  };

  const handleSaveProyecto = async (datos) => {
    if (proyectoAEditar?.id) {
      await window.electronAPI.invoke("proyectos:actualizar", {
        id: proyectoAEditar.id,
        ...datos,
      });
    } else {
      await window.electronAPI.invoke("proyectos:crear", datos);
    }
    setModalOpen(false);
    setProyectoAEditar(null);
    cargarDatos();
  };

  const { porcentaje, urgente } = useMemo(() => {
    const entregados = proyectos.filter((p) => p.estado === "entregado").length;
    const activos = proyectos
      .filter((p) => p.estado !== "entregado" && p.fecha_limite)
      .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
    return {
      porcentaje:
        proyectos.length > 0
          ? Math.round((entregados / proyectos.length) * 100)
          : 0,
      urgente: activos[0] || null,
    };
  }, [proyectos]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-6 pb-20 select-none">
      <HeroSection
        porcentaje={porcentaje}
        urgente={urgente}
        onVerDetalles={verDetalles}
        onNuevoProyecto={() => setModalOpen(true)}
      />

      <div className="space-y-24">
        {materias.map((materia, index) => (
          <motion.section
            key={materia.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <h2 className="text-3xl font-black text-white tracking-tighter mb-10 flex items-center gap-4">
              <div
                className="h-8 w-1.5 rounded-full"
                style={{ backgroundColor: materia.color }}
              />
              {materia.nombre}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(ESTADOS).map(([estadoKey, info]) => (
                <KanbanColumn
                  key={estadoKey}
                  estado={estadoKey}
                  info={info}
                  proyectos={proyectos}
                  materiaId={materia.id}
                  onDragEnd={handleDragEnd}
                  onEditar={editarProyecto}
                  onVerDetalles={verDetalles}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <ProyectoDetalleModal
        isOpen={detallesOpen}
        proyecto={proyectoEnDetalle}
        materias={materias}
        onClose={() => setDetallesOpen(false)}
        onEditar={editarProyecto}
      />

      <ModalNuevoProyecto
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setProyectoAEditar(null);
        }}
        onSave={handleSaveProyecto}
        materias={materias}
        proyecto={proyectoAEditar}
      />
    </div>
  );
};

export default ProyectoDashboard;
