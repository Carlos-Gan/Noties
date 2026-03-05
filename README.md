# 🧠 Noties Workspace
> **v0.0.1-alpha** | Mi "Segundo Cerebro" para la Universidad.

**Noties** es una aplicación de escritorio diseñada para estudiantes que necesitan una organización superior. Inspirada en la flexibilidad de **Anytype** y el minimalismo de **Notion**, Noties centraliza tus clases, apuntes en Markdown y el seguimiento de proyectos en una base de datos local, privada y portátil.



---

## ✨ Características v0.0.1

- **🗂️ Gestión de Clases Dinámica:** Crea materias con parámetros personalizados (Profesor, Semestre, Links, etc.) mediante un sistema de metadatos flexible.
- **🎨 Identidad Visual Semántica:** Sistema de colores dinámicos. Al cambiar el color de una sección (Apuntes, Tareas, Proyectos) en la Sidebar, toda la interfaz se sincroniza instantáneamente.
- **💾 Cerebro Portátil (SQLite):** Al iniciar, la app permite crear o abrir una base de datos en cualquier ubicación (Dropbox, Drive, USB), permitiendo la portabilidad total de tu información.
- **🚀 Dashboard de Pendientes:** Visualización de "Pendientes Críticos" directamente en las tarjetas de materia, diferenciando entre tareas simples y proyectos.
- **🌑 Interfaz Dark Mode:** Diseño optimizado para largas sesiones de estudio nocturnas.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React.js + Tailwind CSS
* **Runtime:** Electron.js
* **Base de Datos:** SQLite (vía `better-sqlite3`)
* **Animaciones:** Framer Motion



---

## 🚀 Instalación y Desarrollo

### Requisitos previos
* [Node.js](https://nodejs.org/) (v16+)
* npm o yarn

### Configuración
1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/noties-workspace.git](https://github.com/tu-usuario/noties-workspace.git)
    cd noties-workspace
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
- [ ] **Command Palette:** Activación completa de `Ctrl + K` para navegación ultra rápida.

---

## 📄 Estructura de Datos (Híbrida)

La aplicación utiliza un enfoque de **Esquema Flexible**:
- **Tablas Relacionales:** Para la estructura base (Materias, Apuntes).
- **Metadata JSON:** Para permitir que el usuario añada columnas infinitas sin romper la base de datos.



---

## 👤 Autor
**Carlos** - *Desarrollador y Estudiante*
> "Construyendo las herramientas que desearía haber tenido el primer día de clases."

---