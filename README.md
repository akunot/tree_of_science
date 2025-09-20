# tree_of_science
# Árbol de la Ciencia - Universidad Nacional de Colombia

Una aplicación web moderna para la generación y gestión de árboles de conocimiento científico.

## 🌟 Características

- **Generación de Árboles de la Ciencia**: Crea estructuras de conocimiento a partir de semillas conceptuales
- **Gestión de Bibliografías**: Sube y organiza archivos de referencia (PDF, DOC, DOCX, TXT)
- **Historial Completo**: Visualiza y gestiona todos tus árboles creados
- **Múltiples Formatos de Descarga**: Exporta en JSON y PDF
- **Interfaz Moderna**: Diseño responsive y profesional
- **Autenticación Segura**: Sistema JWT con recuperación de contraseña

## 🚀 Inicio Rápido

### Prerrequisitos

- Python 3.11+
- Node.js 22+
- pnpm

### Instalación

1. **Clona el repositorio:**
```bash
git clone https://github.com/akunot/tree_of_science
cd arbol-ciencia-unal
```

2. **Configura el Backend (Django):**
```bash
cd unal_tree_science
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

3. **Configura el Frontend (React):**
```bash
cd tree-science-frontend
pnpm install
pnpm run dev --host
```

4. **Accede a la aplicación:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 📁 Estructura del Proyecto

```
├── tree_of_science/          # Backend Django
│     ├── tree_of_science/   # Configuración principal
│     ├── authentication/         # Autenticación de usuarios
│     ├── bibliography/          # Gestión de bibliografías
│     ├── trees/                 # Generación de árboles
│    └── manage.py
│   ├── tos_frontend/     # Frontend React
│     ├── src/
│        ├── components/        # Componentes React
│        ├── hooks/            # Hooks personalizados
│        ├── lib/              # Utilidades
│     └── package.json
├── documentacion_tecnica.md   # Documentación técnica completa
└── README.md
```

## 🛠 Tecnologías

**Backend:**
- Django 5.2.6
- Django REST Framework
- JWT Authentication
- SQLite/PostgreSQL

**Frontend:**
- React 19
- Vite
- TanStack Query
- Tailwind CSS
- shadcn/ui

## 📖 Uso

### 1. Registro e Inicio de Sesión
- Crea una cuenta con tu correo institucional
- Inicia sesión para acceder a todas las funcionalidades

### 2. Generar un Árbol de la Ciencia
- Ve a "Generar Árbol"
- Ingresa una semilla conceptual (ej: "Inteligencia artificial en medicina")
- Opcionalmente, agrega un título y selecciona una bibliografía
- Haz clic en "Generar Árbol de la Ciencia"

### 3. Gestionar Bibliografías
- Ve a "Bibliografía"
- Arrastra y suelta archivos o usa el botón "Seleccionar Archivo"
- Gestiona tus archivos de referencia

### 4. Ver Historial
- Ve a "Historial" para ver todos tus árboles
- Busca, filtra y descarga tus árboles en diferentes formatos

## 🔧 API Endpoints

### Autenticación
- `POST /auth/register/` - Registro
- `POST /auth/login/` - Inicio de sesión
- `POST /auth/forgot-password/` - Recuperar contraseña

### Árboles
- `POST /bibliography/tree/` - Generar árbol
- `GET /bibliography/tree/history/` - Historial
- `GET /bibliography/tree/<id>/` - Detalles del árbol

### Bibliografías
- `GET /bibliography/list/` - Listar bibliografías
- `POST /bibliography/upload/` - Subir archivo
- `DELETE /bibliography/<id>/` - Eliminar

## 🧪 Testing

La aplicación ha sido probada exhaustivamente:

- ✅ Autenticación y autorización
- ✅ Generación de árboles
- ✅ Gestión de bibliografías
- ✅ Descarga de archivos
- ✅ Interfaz responsive
- ✅ Manejo de errores

## 🔒 Seguridad

- Autenticación JWT
- Validación de datos
- Protección CORS
- Sanitización de entrada
- Tipos de archivo validados

## 📚 Documentación

Para documentación técnica detallada, consulta `documentacion_tecnica.md`.

## 🤝 Contribución

Este proyecto fue desarrollado para la Universidad Nacional de Colombia. Para contribuciones o mejoras, contacta al equipo de desarrollo.

## 📄 Licencia

Desarrollado para la Universidad Nacional de Colombia - 2025

## 🆘 Soporte

Para soporte técnico o consultas:
- Revisa la documentación técnica
- Contacta al equipo de desarrollo de la UNAL

---

**Desarrollado con ❤️ para la Universidad Nacional de Colombia**


