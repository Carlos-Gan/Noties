import { useState, useEffect } from "react";
import MateriaDashboard from "./MateriaDashboard";
import MateriaApuntes from "./MateriaApuntes";

const MateriaDetalle = ({
  materia,
  onVolver,
  configSecciones,
  idNotaInicial,
  vistaInicial = "dashboard", // 👈 Nueva prop con valor por defecto
}) => {
  const [vista, setVista] = useState(vistaInicial);

  // Efecto para cambiar la vista si llega una nueva prop
  useEffect(() => {
    if (vistaInicial) {
      setVista(vistaInicial);
    }
  }, [vistaInicial]);

  // Efecto para abrir una nota específica cuando llegamos a apuntes
  useEffect(() => {
    if (vista === "apuntes" && idNotaInicial) {
      // Pequeño delay para que el componente de apuntes esté listo
      setTimeout(() => {
        // Disparar un evento o usar ref para abrir la nota
        window.dispatchEvent(
          new CustomEvent("abrir-nota", {
            detail: { notaId: idNotaInicial },
          }),
        );
      }, 100);
    }
  }, [vista, idNotaInicial]);

  if (vista === "apuntes") {
    return (
      <MateriaApuntes
        materia={materia}
        onVolver={() => setVista("dashboard")}
        configSecciones={configSecciones}
        idNotaInicial={idNotaInicial}
      />
    );
  }

  return (
    <MateriaDashboard
      materia={materia}
      onVolver={onVolver}
      onVerApuntes={() => setVista("apuntes")}
      configSecciones={configSecciones}
    />
  );
};

export default MateriaDetalle;
