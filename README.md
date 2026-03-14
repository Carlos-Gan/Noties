# 🧠 Noties Workspace

> **v1.1.0** | Mi "Segundo Cerebro" para la Universidad.

**Noties** es una aplicación de escritorio diseñada para estudiantes que buscan una organización superior. Inspirada en la flexibilidad de **Anytype** y el minimalismo de **Notion**, Noties centraliza tus clases, apuntes en Markdown y el seguimiento de proyectos en una base de datos local, privada y portátil.

🔗 **Repositorio:** [https://github.com/Carlos-Gan/Noties](https://github.com/Carlos-Gan/Noties)

---

## ✨ Características v1.0.0 (Lanzamiento Funcional)

Esta versión marca el primer hito estable del proyecto, integrando herramientas avanzadas de edición y gestión académica.

### 📝 Notas y Editor Pro

- **Editor Enriquecido:** Soporte nativo para bloques de código, **imágenes** y renderizado de fórmulas **LaTeX** mediante cadenas de texto (vía KaTeX).
- **Dashboard de Notas:** Nueva vista centralizada para explorar y gestionar todos los apuntes del semestre de forma organizada.
- **Exportación a PDF:** Generación de documentos profesionales a partir de tus notas Markdown con un solo clic para entregas formales.

### 📂 Gestión de Clases y Semestres

- **Archivado Automático:** Sistema inteligente que detecta el fin de cursos y archiva materias según tu configuración para mantener el espacio de trabajo limpio.
- **Centro de Archivo:** Interfaz dedicada para consultar, recuperar o eliminar clases de periodos académicos anteriores.

### 🕹️ Experiencia de Usuario (UX)

- **Navegación por Mouse:** Soporte para botones adicionales del mouse (Back/Forward) para un flujo de navegación fluido entre dashboards.
- **Kanban Interactivo:** Sistema de _Drag & Drop_ para gestionar el ciclo de vida de tus proyectos (Pendiente, En curso, Entregado).
- **Visualización Crítica:** Telemetría en el Dashboard principal para identificar tareas urgentes y el avance porcentual global por materia.

---

## 🆕 Novedades v1.1.0

Esta actualización se enfoca en mejorar la gestión de horarios y la flexibilidad en la edición de materias sin comprometer la integridad de la base de datos.

### 📅 Gestión de Horarios Inteligente

- **Horario Multisesión:** Nueva funcionalidad para agregar múltiples bloques de horario (Día, Salón, Inicio/Fin) por materia.
- **Renderizado de Datos Complejos:** Lógica de visualización optimizada para procesar arrays de objetos JSON, transformando datos crudos en tarjetas visuales claras.

### ✏️ Edición In-Situ y UI

- **Dashboard Editable:** Los metadatos de la materia (Profesor, Links, Estado) ahora son editables mediante doble clic directamente en el Sidebar, eliminando la necesidad de formularios externos.
- **Sistema de Badges Dinámicos:** Visualización de estados mediante etiquetas con colores inteligentes que responden al contexto de la materia.
- **Layout Refinado:** Sidebar con contrastes mejorados y tipografía optimizada para lectura rápida de horarios y estadísticas.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React.js + Tailwind CSS + Framer Motion (para animaciones fluidas).
- **Runtime:** Electron.js (asegurando una experiencia nativa en escritorio).
- **Base de Datos:** SQLite (vía `better-sqlite3`) para almacenamiento local y persistente.
- **Procesamiento:** Markdown Engine + KaTeX (para renderizado matemático científico).

---

## 📄 Arquitectura y Estructura de Datos

La aplicación utiliza un enfoque de **Esquema Híbrido** diseñado para la flexibilidad del estudiante de ingeniería:

1. **Tablas Relacionales:** Uso de tablas estándar (`materias`, `proyectos`, `apuntes`) para consultas de alto rendimiento, ordenamiento y filtrado SQL tradicional.
2. **Metadata JSON Extensible:** Implementación de una columna de tipo TEXT para almacenar objetos JSON. Esto permite añadir campos personalizados (como arrays de horarios o enlaces de bibliografía) sin necesidad de realizar migraciones de base de datos o alterar el esquema físico.
3. **Comunicación IPC Segura:** Protocolo de comunicación asíncrona entre el proceso de renderizado y el proceso principal (Main) de Electron, garantizando que el acceso a archivos y base de datos no bloquee la interfaz de usuario.

---

## 👤 Autor

**Carlos-Gandara** - _Desarrollador y Estudiante de Ingeniería en Sistemas_

> "Construyendo las herramientas que desearía haber tenido el primer día de clases."