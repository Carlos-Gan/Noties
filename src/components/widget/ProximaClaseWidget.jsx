import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClock, FiBookOpen, FiSun, FiMoon } from "react-icons/fi";

const ProximaClaseWidget = ({ materias = [], horariosPorMateria = {} }) => {
  const [proximaClase, setProximaClase] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState("");

  useEffect(() => {
    const calcularProximaClase = () => {
      const ahora = new Date();
      const diaActual = ahora.getDay(); // 0 Dom, 1 Lun, 2 Mar, 3 Mié, 4 Jue, 5 Vie, 6 Sab
      const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

      // Mapeo de días
      const diasMap = {
        'Dom': 0, 'Lun': 1, 'Mar': 2, 'Mié': 3, 'Mie': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Sab': 6
      };

      let proxima = null;
      let menorDiferencia = Infinity;

      materias.forEach(materia => {
        try {
          // Intentar obtener horarios del metadata de la materia
          const meta = typeof materia.metadata === 'string' 
            ? JSON.parse(materia.metadata || "{}") 
            : materia.metadata || {};
          
          const horarios = meta.horario || horariosPorMateria[materia.id] || [];
          
          horarios.forEach(horario => {
            const diaNum = diasMap[horario.dia];
            if (diaNum === undefined) return;

            const [hInicio, mInicio] = horario.inicio.split(':').map(Number);
            const horaInicio = hInicio * 60 + mInicio;
            
            let diferencia;
            if (diaNum > diaActual || (diaNum === diaActual && horaInicio > horaActual)) {
              // Misma semana
              diferencia = (diaNum - diaActual) * 24 * 60 + (horaInicio - horaActual);
            } else {
              // Próxima semana
              diferencia = (7 - diaActual + diaNum) * 24 * 60 + (horaInicio - horaActual);
            }

            if (diferencia < menorDiferencia) {
              menorDiferencia = diferencia;
              proxima = {
                materia,
                horario,
                dia: horario.dia,
                inicio: horario.inicio,
                fin: horario.fin,
                salon: horario.salon,
                diferencia
              };
            }
          });
        } catch (e) {
          console.error("Error parseando horario:", e);
        }
      });

      setProximaClase(proxima);

      // Calcular tiempo restante en formato legible
      if (proxima) {
        const horas = Math.floor(proxima.diferencia / 60);
        const minutos = proxima.diferencia % 60;
        if (horas > 24) {
          const dias = Math.floor(horas / 24);
          setTiempoRestante(`En ${dias} día${dias !== 1 ? 's' : ''}`);
        } else if (horas > 0) {
          setTiempoRestante(`En ${horas} hora${horas !== 1 ? 's' : ''}`);
        } else {
          setTiempoRestante(`En ${minutos} minutos`);
        }
      }
    };

    calcularProximaClase();
    const interval = setInterval(calcularProximaClase, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, [materias, horariosPorMateria]);

  if (!proximaClase) {
    return (
      <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl p-6 h-full flex flex-col items-center justify-center">
        <FiClock className="text-gray-500 mb-3" size={32} />
        <p className="text-gray-400 text-sm">No hay clases programadas</p>
        <p className="text-xs text-gray-600 mt-2">Disfruta tu tiempo libre</p>
      </div>
    );
  }

  const esManana = proximaClase.diferencia < 12 * 60;
  const esHoy = proximaClase.diferencia < 24 * 60 && 
                new Date().getDay() === ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].indexOf(proximaClase.dia);

  return (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-3xl p-6 h-full relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-white/80 mb-4">
          {esHoy ? <FiSun className="text-yellow-300" /> : <FiMoon className="text-white/60" />}
          <span className="text-xs font-black uppercase tracking-widest">
            {esHoy ? "HOY" : esManana ? "MUY PRONTO" : "PRÓXIMA CLASE"}
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-black text-white mb-1">
              {proximaClase.materia.nombre}
            </h3>
            <p className="text-white/80 text-sm mb-4">
              Prof. {proximaClase.materia.profesor || "No asignado"}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white/90">
                <FiClock size={16} />
                <span className="text-sm font-medium">
                  {proximaClase.inicio} - {proximaClase.fin}
                </span>
              </div>
              {proximaClase.salon && (
                <div className="flex items-center gap-3 text-white/90">
                  <FiBookOpen size={16} />
                  <span className="text-sm font-medium">Salón {proximaClase.salon}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-black text-white mb-1">
              {proximaClase.dia}
            </div>
            <div className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
              {tiempoRestante}
            </div>
          </div>
        </div>

        {/* Barra de progreso visual */}
        {esHoy && (
          <div className="mt-4">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "60%" }} // Esto debería calcularse basado en la hora actual
                className="h-full bg-white rounded-full"
              />
            </div>
            <p className="text-[10px] text-white/60 mt-2 text-right">
              {proximaClase.inicio} - {proximaClase.fin}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProximaClaseWidget;