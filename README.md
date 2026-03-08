# 🧠 Noties Workspace
> **v0.0.7-beta** | Mi "Segundo Cerebro" para la Universidad.

**Noties** es una aplicación de escritorio diseñada para estudiantes que buscan una organización superior. Inspirada en la flexibilidad de **Anytype** y el minimalismo de **Notion**, Noties centraliza tus clases, apuntes en Markdown y el seguimiento de proyectos en una base de datos local, privada y portátil.

🔗 **Repositorio:** [https://github.com/Carlos-Gan/Noties](https://github.com/Carlos-Gan/Noties)

---

## ✨ Características v0.0.7 (Novedades)

- **🕹️ Kanban Interactivo:** Sistema de *Drag & Drop* fluido para mover proyectos entre estados (Pendiente, En curso, Entregado) con persistencia instantánea en SQLite.
- **🔍 Ficha Técnica de Proyectos:** Nuevo modal de visualización profunda con jerarquía visual mejorada para descripciones largas, fechas límite y niveles de prioridad.
- **🖱️ Interacción Contextual:** - **Clic Izquierdo:** Abrir detalles de lectura con diseño inmersivo.
    - **Clic Derecho:** Acceso directo al editor de parámetros y configuración de secciones (ContextMenu).
- **📊 Telemetría en Dashboard:** Cálculo en tiempo real de "Pendientes Críticos", porcentaje de avance por materia y detección automática del **Objetivo Prioritario** (entrega más cercana).
- **🎨 UI Semántica Avanzada:** Sincronización de colores entre la Sidebar y las tarjetas de materia, incluyendo estados visuales (opacidad en entregados y pulsación en urgentes).

---

## 🛠️ Stack Tecnológico

* **Frontend:** React.js + Tailwind CSS
* **Runtime:** Electron.js
* **Base de Datos:** SQLite (vía `better-sqlite3`)
* **Animaciones:** Framer Motion (Reorder & Layout Animations)
* **Iconografía:** React Icons (Feather & Fi)

---

## 🚀 Instalación y Desarrollo

### Requisitos previos
* [Node.js](https://nodejs.org/) (v18+)
* npm o yarn

### Configuración
1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/Carlos-Gan/Noties.git](https://github.com/Carlos-Gan/Noties.git)
    cd Noties
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    ```

---

## 📅 Roadmap 0.1.0

- [ ] **Markdown Engine:** Implementar editor de notas con soporte para fórmulas LaTeX y bloques de código.
- [ ] **Persistencia de Colores:** Guardar la configuración de la Sidebar en la tabla `config_app`.
- [ ] **Filtros por Semestre:** Vista filtrada para enfocarse solo en las materias del periodo actual.
- [ ] **Notificaciones:** Alertas de escritorio para proyectos que vencen en menos de 24 horas.

---

## 📄 Estructura de Datos (Actualizada)

La aplicación utiliza un enfoque de **Esquema Híbrido**:
- **Tablas Relacionales:** `materias`, `proyectos` (campos optimizados: `prioridad`, `unidad`, `estado`, `fecha_limite`).
- **Metadata JSON:** Para permitir que el usuario añada campos personalizados en las materias sin alterar el esquema SQL.
- **Comunicación IPC:** Manejo asíncrono de promesas entre el proceso de renderizado y el proceso principal para garantizar una UI libre de bloqueos.

---

## 👤 Autor
**Carlos-Gandara** - *Desarrollador y Estudiante*
> "Construyendo las herramientas que desearía haber tenido el primer día de clases."