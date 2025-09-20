# Documentación Técnica - Árbol de la Ciencia UNAL

## Descripción General

La aplicación "Árbol de la Ciencia" es una plataforma web desarrollada para la Universidad Nacional de Colombia que permite a usuarios registrados crear gráficos de árboles de la ciencia mediante el ingreso de semillas conceptuales, gestionar su historial de árboles creados y descargar información en diferentes formatos.

## Arquitectura del Sistema

### Tecnologías Utilizadas

**Backend:**
- Django 5.2.6
- Django REST Framework 3.16.1
- Django REST Framework SimpleJWT 5.5.1
- Django CORS Headers 4.8.0
- SQLite (base de datos por defecto)
- Python 3.11

**Frontend:**
- React 19.1.0
- Vite 6.3.5 (bundler)
- TanStack Query (React Query) para manejo de estado
- React Router DOM para navegación
- Tailwind CSS para estilos
- shadcn/ui para componentes de interfaz
- Lucide React para iconos

### Estructura del Proyecto

```
├── unal_tree_science/          # Backend Django
│   ├── tree_science_backend/   # Configuración principal
│   ├── authentication/         # Autenticación de usuarios
│   ├── bibliography/          # Gestión de bibliografías
│   ├── trees/                 # Generación de árboles
│   └── manage.py
├── tree-science-frontend/     # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── hooks/            # Hooks personalizados
│   │   └── lib/              # Utilidades
│   └── package.json
├── documentacion_tecnica.md   # Documentación técnica completa
└── README.md
```

## Base de Datos

### Modelos Implementados

#### User (Modelo de Usuario Personalizado)
```python
class User(AbstractUser):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
```

#### Bibliography (Bibliografía)
```python
class Bibliography(models.Model):
    id_biblio = models.AutoField(primary_key=True)
    nombre_archivo = models.CharField(max_length=255)
    archivo = models.FileField(upload_to='bibliographies/')
    fecha_subida = models.DateTimeField(auto_now_add=True)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE)
```

#### Tree (Árbol)
```python
class Tree(models.Model):
    id_arbol = models.AutoField(primary_key=True)
    arbol_json = models.JSONField()
    fecha_generado = models.DateTimeField(auto_now_add=True)
    id_biblio = models.ForeignKey(Bibliography, on_delete=models.SET_NULL, null=True, blank=True)
    seed = models.TextField()
    title = models.CharField(max_length=255, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
```

## API Endpoints

### Autenticación
- `POST /auth/register/` - Registro de usuario
- `POST /auth/login/` - Inicio de sesión
- `POST /auth/token/refresh/` - Renovar token JWT
- `POST /auth/forgot-password/` - Solicitar recuperación de contraseña
- `POST /auth/reset-password/` - Restablecer contraseña

### Bibliografías
- `GET /bibliography/list/` - Listar bibliografías del usuario
- `POST /bibliography/upload/` - Subir nueva bibliografía
- `GET /bibliography/download/<id>/` - Descargar bibliografía
- `DELETE /bibliography/<id>/` - Eliminar bibliografía

### Árboles
- `POST /bibliography/tree/` - Generar nuevo árbol
- `GET /bibliography/tree/history/` - Historial de árboles del usuario
- `GET /bibliography/tree/<id>/` - Detalles de un árbol específico
- `GET /bibliography/tree/<id>/download/<format>/` - Descargar árbol en formato específico
- `DELETE /bibliography/tree/<id>/` - Eliminar árbol

## Funcionalidades Principales

### 1. Sistema de Autenticación
- Registro de usuarios con validación de datos
- Inicio de sesión con JWT
- Recuperación de contraseña por correo electrónico
- Protección de rutas mediante autenticación

### 2. Generación de Árboles de la Ciencia
- Ingreso de semilla conceptual
- Título opcional para el árbol
- Selección opcional de bibliografía de referencia
- Generación automática de estructura jerárquica
- Visualización interactiva del árbol generado

### 3. Gestión de Bibliografías
- Subida de archivos (PDF, DOC, DOCX, TXT)
- Listado y búsqueda de bibliografías
- Descarga de archivos subidos
- Eliminación de bibliografías

### 4. Historial y Gestión de Árboles
- Visualización de todos los árboles creados
- Búsqueda y filtrado por título, semilla o bibliografía
- Descarga en múltiples formatos (JSON, PDF)
- Eliminación de árboles
- Estadísticas de uso

### 5. Interfaz de Usuario
- Diseño responsive para desktop y móvil
- Dashboard con estadísticas y accesos rápidos
- Navegación intuitiva entre secciones
- Feedback visual para todas las acciones
- Manejo de errores y estados de carga

## Configuración y Ejecución

### Requisitos del Sistema
- Python 3.11+
- Node.js 22+
- pnpm (gestor de paquetes)

### Configuración del Backend

1. **Instalar dependencias:**
```bash
cd unal_tree_science
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
```

2. **Ejecutar migraciones:**
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Iniciar servidor de desarrollo:**
```bash
python manage.py runserver 0.0.0.0:8000
```

### Configuración del Frontend

1. **Instalar dependencias:**
```bash
cd tree-science-frontend
pnpm install
```

2. **Iniciar servidor de desarrollo:**
```bash
pnpm run dev --host
```

### URLs de Acceso
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/admin

## Seguridad

### Medidas Implementadas
- Autenticación JWT con tokens de acceso y renovación
- Validación de datos en frontend y backend
- Protección CORS configurada
- Validación de tipos de archivo en subida de bibliografías
- Sanitización de datos de entrada
- Protección contra inyección SQL mediante ORM de Django

### Consideraciones de Producción
- Configurar variables de entorno para claves secretas
- Usar base de datos PostgreSQL en producción
- Implementar HTTPS
- Configurar límites de subida de archivos
- Implementar rate limiting para APIs
- Configurar logging y monitoreo

## Testing

### Pruebas Realizadas
- ✅ Registro de usuario con validación
- ✅ Inicio de sesión y manejo de tokens
- ✅ Generación de árboles de la ciencia
- ✅ Visualización de árboles generados
- ✅ Descarga de archivos en diferentes formatos
- ✅ Gestión de bibliografías
- ✅ Navegación entre secciones
- ✅ Responsive design en diferentes dispositivos
- ✅ Manejo de errores y estados de carga

### Casos de Prueba Cubiertos
1. **Autenticación:**
   - Registro exitoso con datos válidos
   - Validación de contraseñas débiles
   - Inicio de sesión con credenciales correctas
   - Manejo de errores de autenticación

2. **Generación de Árboles:**
   - Creación con semilla válida
   - Generación con y sin bibliografía
   - Visualización de estructura jerárquica
   - Persistencia de datos generados

3. **Gestión de Datos:**
   - Subida de archivos de bibliografía
   - Descarga en formatos JSON y PDF
   - Eliminación de registros
   - Búsqueda y filtrado

## Soporte y Contacto

Para soporte técnico o consultas sobre la implementación, contactar al equipo de desarrollo de la Universidad Nacional de Colombia.

---

**Versión:** 1.0  
**Fecha:** Septiembre 2025  
**Desarrollado para:** Universidad Nacional de Colombia

