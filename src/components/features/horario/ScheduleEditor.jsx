import { useState } from "react";

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function ScheduleEditor({ value = [], onChange }) {
  const [horarios, setHorarios] = useState(value);

  const agregar = () => {
    const nuevo = [
      ...horarios,
      { dia: "Lun", inicio: "07:00", fin: "08:00", salon: "" },
    ];
    setHorarios(nuevo);
    onChange(nuevo);
  };

  const actualizar = (index, campo, val) => {
    const copia = [...horarios];
    copia[index][campo] = val;
    setHorarios(copia);
    onChange(copia);
  };

  const eliminar = (index) => {
    const copia = horarios.filter((_, i) => i !== index);
    setHorarios(copia);
    onChange(copia);
  };

  return (
    <div className="space-y-2 mt-2">

      {horarios.map((h, i) => (
        <div key={i} className="flex gap-2 items-center">

          <select
            value={h.dia}
            onChange={(e)=>actualizar(i,"dia",e.target.value)}
            className="bg-[#1a1a1a] text-xs rounded-lg p-2"
          >
            {dias.map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <input
            type="time"
            value={h.inicio}
            onChange={(e)=>actualizar(i,"inicio",e.target.value)}
            className="bg-[#1a1a1a] text-xs rounded-lg p-2"
          />

          <input
            type="time"
            value={h.fin}
            onChange={(e)=>actualizar(i,"fin",e.target.value)}
            className="bg-[#1a1a1a] text-xs rounded-lg p-2"
          />

          <input
            placeholder="Salón"
            value={h.salon}
            onChange={(e)=>actualizar(i,"salon",e.target.value)}
            className="bg-[#1a1a1a] text-xs rounded-lg p-2 w-16"
          />

          <button
            onClick={()=>eliminar(i)}
            className="text-red-400 text-xs"
          >
            ✕
          </button>

        </div>
      ))}

      <button
        type="button"
        onClick={agregar}
        className="text-xs text-blue-400 hover:text-blue-300"
      >
        + Agregar horario
      </button>

    </div>
  );
}