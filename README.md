# 🧠 Noties Workspace
> **v1.0.0** | Mi "Segundo Cerebro" para la Universidad.

**Noties** es una aplicación de escritorio diseñada para estudiantes que buscan una organización superior. Inspirada en la flexibilidad de **Anytype** y el minimalismo de **Notion**, Noties centraliza tus clases, apuntes en Markdown y el seguimiento de proyectos en una base de datos local, privada y portátil.

🔗 **Repositorio:** [https://github.com/Carlos-Gan/Noties](https://github.com/Carlos-Gan/Noties)

---

## ✨ Características v1.0.0 (Lanzamiento Funcional)

Esta versión marca el primer hito estable del proyecto, integrando herramientas avanzadas de edición y gestión académica.

### 📝 Notas y Editor Pro
- **Editor Enriquecido:** Soporte nativo para bloques de código, **imágenes** y renderizado de fórmulas **LaTeX** mediante cadenas de texto.
- **Dashboard de Notas:** Nueva vista centralizada para explorar y gestionar todos los apuntes del semestre.
- **Exportación a PDF:** Generación de documentos profesionales a partir de tus notas con un solo clic.

### 📂 Gestión de Clases y Semestres
- **Archivado Automático:** Sistema inteligente que detecta el fin de cursos y archiva materias según tu configuración.
- **Centro de Archivo:** Interfaz para consultar, recuperar o eliminar clases de periodos anteriores.

### 🕹️ Experiencia de Usuario (UX)
- **Navegación por Mouse:** Soporte para botones adicionales del mouse (Back/Forward) para un flujo de trabajo más rápido.
- **Kanban Interactivo:** Sistema de *Drag & Drop* para mover proyectos entre estados (Pendiente, En curso, Entregado).
- **Visualización Crítica:** Telemetría en el Dashboard para identificar tareas urgentes y avance global por materia.

### 🛠️ Mejoras Técnicas
- **Corrección de Renderizado:** Arreglos masivos en la visualización CSS para entornos oscuros.
- **Persistencia Robusta:** Manejo de base de datos SQLite con verificaciones de integridad al arranque.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React.js + Tailwind CSS + Framer Motion
* **Runtime:** Electron.js
* **Base de Datos:** SQLite (vía `better-sqlite3`)
* **Procesamiento:** Markdown Engine + KaTeX (LaTeX)

---

## 🚀 Instalación y Desarrollo

### Requisitos previos
* [Node.js](https://nodejs.org/) (v18+)
* npm

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
3.  **Ejecutar en modo desarrollo (Incluye parches para Linux):**
    ```bash
    npm run start
    ```

---

## 📄 Estructura de Datos

La aplicación utiliza un enfoque de **Esquema Híbrido**:
- **Tablas Relacionales:** `materias`, `proyectos` y `apuntes` para consultas de alto rendimiento.
- **Metadata JSON:** Permite añadir campos personalizados (Profesor, Horario, Links) sin alterar el esquema SQL.
- **Comunicación IPC:** Protocolo asíncrono entre el proceso de renderizado y el sistema de archivos para garantizar fluidez.

---

## 👤 Autor
**Carlos-Gandara** - *Desarrollador y Estudiante de Ingeniería en Sistemas*
> "Construyendo las herramientas que desearía haber tenido el primer día de clases."