# 🧠 Noties Workspace v1.1.5

<div align="center">

**Tu segundo cerebro académico - Gestión local, privada y profesional para ingeniería**

[![Version](https://img.shields.io/badge/version-1.1.5-blue.svg)](https://github.com/Carlos-Gan/Noties)
[![Electron](https://img.shields.io/badge/Electron-40.7.0-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## 📖 Sobre Noties

**Noties** es una aplicación de escritorio diseñada para estudiantes que buscan una organización superior. Inspirada en la flexibilidad de **Anytype** y el minimalismo de **Notion**, centraliza tus clases, apuntes en Markdown y el seguimiento de proyectos en una base de datos local, privada y portátil.

> "Construyendo las herramientas que desearía haber tenido el primer día de clases."

---

## ✨ Características Principales

### 📝 Editor Enriquecido Pro

- **Comandos Slash (`/`):** Inserción rápida de bloques.
- **Bloques de Código:** Resaltado de sintaxis para más de 20 lenguajes.
- **Matemáticas Avanzadas:** Renderizado de fórmulas **LaTeX** mediante KaTeX.
- **Exportación a PDF:** Generación de documentos profesionales limpios con un solo clic.

### 📊 Gestión Académica e Inteligente

- **Grade Predictor:** Sistema de proyecciones (pesimista/optimista) basado en unidades y materias.
- **Horario Multisesión:** Gestión de múltiples bloques (Día, Salón, Hora) con cuenta regresiva para tu próxima clase.
- **Kanban Interactivo:** Gestión de proyectos mediante _Drag & Drop_ (Pendiente, En curso, Entregado).
- **Archivado Automático:** Sistema que detecta el fin de cursos para mantener tu espacio de trabajo limpio.

### 🎯 UX & Telemetría

- **Navegación Fluida:** Soporte para botones laterales del mouse (Back/Forward).
- **Visualización Crítica:** Identificación inmediata de tareas urgentes y avance porcentual global.

---

## 🆕 Novedades en v1.1.5

### 🎨 Mejoras en el Editor

- ✅ Nuevo bloque de código con selector de lenguaje integrado.
- ✅ Comandos slash optimizados y más rápidos.
- ✅ Exportación a PDF mejorada (ahora solo exporta el contenido del apunte, eliminando ruido visual).

### 📈 Calificaciones y Unidades

- ✅ Se añadió el parámetro de **Unidad** a las evaluaciones para un control granular.
- ✅ Alertas de porcentajes excedidos en el Grade Predictor.

### 🔧 Optimización Técnica

- ✅ **Bug Fix:** El bloque de código ya no congela la interfaz.
- ✅ **Performance:** Optimización en el manejo de timers y sincronización de notas.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Tailwind CSS + Framer Motion.
- **Runtime:** Electron 40 (Experiencia nativa de escritorio).
- **Base de Datos:** SQLite (vía `better-sqlite3`) con **Esquema Híbrido**:
  - Tablas relacionales para alto rendimiento.
  - Metadata JSON extensible para campos personalizados sin migraciones.
- **Comunicación:** Protocolo IPC seguro para operaciones asíncronas.

---

## 🚀 Instalación (Desarrollo)

```bash
# 1. Clonar el repositorio
git clone [https://github.com/Carlos-Gan/Noties.git](https://github.com/Carlos-Gan/Noties.git)

# 2. Instalar dependencias
npm install

# 3. Reconstruir módulos nativos (SQLite)
npm run rebuild

# 4. Correr en modo dev
npm run start
---
```

## 👤 Autor

**Carlos-Gandara** - _Desarrollador y Estudiante_

> "Construyendo las herramientas que desearía haber tenido el primer día de clases."

# Cosas agregadas

- Se agrego Unidad a los parametros de evaluaciones
- Mejora al exportar el apunte a pdf
- Arreglo de bugs
- Optimizacion en las notas

<sub>© 2026 Noties Workspace - Licencia MIT</sub>