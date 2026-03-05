const FieldInput = ({ field, onChange }) => {
  // 1. Selector Múltiple (Días)
  if (field.type === 'multi-select') {
    const opciones = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {opciones.map(dia => (
          <button
            key={dia}
            onClick={() => {
              const newValue = field.value.includes(dia) 
                ? field.value.filter(d => d !== dia) 
                : [...field.value, dia];
              onChange(newValue);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              field.value.includes(dia) 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
              : 'bg-white/5 text-gray-500 hover:bg-white/10'
            }`}
          >
            {dia}
          </button>
        ))}
      </div>
    );
  }

  // 2. Selector Simple (Horario o Turno)
  if (field.type === 'select') {
    return (
      <select 
        className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl p-2 mt-1 text-sm text-gray-300 outline-none"
        value={field.value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Seleccionar...</option>
        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }

  // 3. Texto normal
  return (
    <input 
      className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl p-2 mt-1 text-sm text-gray-300 outline-none focus:border-blue-500/30"
      value={field.value}
      placeholder={`Escribir ${field.label}...`}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};