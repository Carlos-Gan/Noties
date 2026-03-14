import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiAward, FiCalendar, FiTrendingUp, FiStar } from "react-icons/fi";

const StudyStreakWidget = ({ 
  resumen = { notas: [], proyectos: [] },
  tareasPorMateria = {},
  proyectosPorMateria = {}
}) => {
  const [racha, setRacha] = useState(0);
  const [actividadHoy, setActividadHoy] = useState(false);
  const [actividadSemana, setActividadSemana] = useState([]);
  const [stats, setStats] = useState({
    totalActividad: 0,
    promedioDiario: 0,
    mejorRacha: 0
  });

  useEffect(() => {
    // Calcular racha basado en actividad
    const calcularRacha = () => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      let contador = 0;
      let mejorRacha = 0;
      let actividadPorDia = [];
      
      // Revisar actividad de los últimos 30 días
      for (let i = 0; i < 30; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toDateString();

        // Buscar actividad en esta fecha
        const actividad = 
          resumen.notas.some(n => new Date(n.created_at).toDateString() === fechaStr) ||
          Object.values(tareasPorMateria).flat().some(t => new Date(t.created_at).toDateString() === fechaStr) ||
          Object.values(proyectosPorMateria).flat().some(p => new Date(p.created_at).toDateString() === fechaStr);

        if (actividad) {
          contador++;
          if (i === 0) setActividadHoy(true);
          
          // Registrar actividad para el calendario
          actividadPorDia.push({
            fecha: fechaStr,
            dia: fecha.getDay(),
            activo: true
          });
        } else {
          // Actualizar mejor racha
          if (contador > mejorRacha) {
            mejorRacha = contador;
          }
          contador = 0;
          
          actividadPorDia.push({
            fecha: fechaStr,
            dia: fecha.getDay(),
            activo: false
          });
        }
      }

      setRacha(contador);
      setActividadSemana(actividadPorDia.slice(0, 14).reverse()); // Últimos 14 días
      
      // Calcular estadísticas
      const totalActividad = actividadPorDia.filter(d => d.activo).length;
      setStats({
        totalActividad,
        promedioDiario: (totalActividad / 30).toFixed(1),
        mejorRacha: Math.max(mejorRacha, contador)
      });
    };

    calcularRacha();
  }, [resumen, tareasPorMateria, proyectosPorMateria]);

  const diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  return (
    <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl p-6 relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full -ml-10 -mb-10" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-white/80 mb-4">
          <FiAward size={20} />
          <span className="text-xs font-black uppercase tracking-widest">RACHA DE ESTUDIO</span>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <div className="text-6xl font-black text-white">
            {racha}
          </div>
          <div className="text-white/80 text-sm mb-2">
            {racha === 1 ? 'día' : 'días'} consecutivos
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-white font-bold text-sm">{stats.totalActividad}</p>
            <p className="text-[8px] text-white/60">actividad</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-white font-bold text-sm">{stats.promedioDiario}</p>
            <p className="text-[8px] text-white/60">por día</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-white font-bold text-sm">{stats.mejorRacha}</p>
            <p className="text-[8px] text-white/60">mejor</p>
          </div>
        </div>

        {/* Indicador de hoy */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${actividadHoy ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`} />
          <span className="text-xs text-white/90">
            {actividadHoy 
              ? '✨ ¡Hoy has estudiado!' 
              : '📚 Estudia hoy para mantener tu racha'}
          </span>
        </div>

        {/* Calendario de actividad - últimos 14 días */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiCalendar className="text-white/60" size={12} />
            <span className="text-[10px] text-white/60 uppercase">Actividad reciente</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {actividadSemana.map((dia, i) => (
              <div key={i} className="text-center">
                <div className="text-[8px] text-white/40 mb-1">
                  {diasSemana[new Date(dia.fecha).getDay()]}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[8px] font-bold
                    ${dia.activo 
                      ? 'bg-white text-orange-600' 
                      : 'bg-white/20 text-white/40'
                    }`}
                  title={new Date(dia.fecha).toLocaleDateString()}
                >
                  {new Date(dia.fecha).getDate()}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje motivacional */}
        {racha >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <span className="text-xs text-white/90 bg-white/20 px-3 py-1 rounded-full inline-flex items-center gap-1">
              <FiStar className="text-yellow-300" size={12} />
              ¡{racha} días seguidos! Sigue así
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyStreakWidget;
