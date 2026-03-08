import { useState } from "react";
import MateriaDashboard from "./MateriaDashboard";
import MateriaApuntes from "./MateriaApuntes";

const MateriaDetalle = ({ materia, onVolver, configSecciones, idNotaInicial }) => {
  const [vista, setVista] = useState("dashboard");

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