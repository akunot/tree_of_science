# Documentación Técnica — Árbol de la Ciencia UNAL

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Desarrollado para:** Universidad Nacional de Colombia

---

## Tabla de contenidos

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Base de Datos](#3-base-de-datos)
4. [API Backend](#4-api-backend)
5. [Configuración y Ejecución](#5-configuración-y-ejecución)
6. [Seguridad](#6-seguridad)
7. [Testing y Cobertura Funcional](#7-testing-y-cobertura-funcional)
8. [Soporte y Contacto](#8-soporte-y-contacto)

---

## 1. Descripción General

La aplicación **Árbol de la Ciencia** es una plataforma web desarrollada para la Universidad Nacional de Colombia que permite:

- Generar árboles de la ciencia a partir de semillas conceptuales.
- Gestionar bibliografías de apoyo.
- Mantener un historial de árboles generados por usuario.
- Descargar resultados en JSON y PDF.
- Administrar usuarios, invitaciones y solicitudes de acceso.

El sistema usa una arquitectura **SPA (Single Page Application)** en el frontend y una **API REST** en el backend.

---

## 2. Arquitectura del Sistema

### 2.1 Tecnologías Utilizadas

#### Backend

| Tecnología | Descripción |
|-----------|-------------|
| Django 5.2.6 | Framework principal |
| Django REST Framework | API REST |
| djangorestframework-simplejwt | Autenticación JWT |
| django-cors-headers | Configuración de CORS |
| python-dotenv | Carga de variables de entorno |
| ReportLab | Generación de PDFs |
| SQLite / PostgreSQL | Base de datos (desarrollo / producción) |
| Python 3.11 | Versión de Python requerida |

#### Frontend

| Tecnología | Descripción |
|-----------|-------------|
| React 19 | Biblioteca UI |
| Vite | Bundler y dev server |
| React Router DOM | Enrutamiento |
| TanStack Query | Gestión de estado asíncrono |
| Tailwind CSS | Estilos utility-first |
| shadcn/ui | Componentes de UI |
| lucide-react | Iconografía |
| D3.js | Visualización del árbol |

### 2.2 Estructura del Proyecto

```
├── tree_of_science/           # Backend Django
│   ├── tree_of_science/       # Configuración principal (settings, urls, wsgi)
│   ├── authentication/        # Autenticación, usuarios, invitaciones y auditoría
│   ├── bibliography/          # Gestión de bibliografías
│   ├── trees/                 # Modelos y API para árboles de la ciencia
│   └── manage.py
├── tos_frontend/              # Frontend React (Vite)
│   ├── src/
│   │   ├── components/        # Componentes UI
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── lib/               # Clientes API, helpers
│   │   └── ...
│   └── package.json
├── documentacion_tecnica.md
└── README.md
```

---

## 3. Base de Datos

### 3.1 Usuario Personalizado — `authentication.models.User`

Extiende `AbstractUser` con campos adicionales para autenticación, verificación e invitaciones.

```python
class User(AbstractUser):
    user_state = models.CharField(
        max_length=10,
        choices=USER_STATES,   # PENDING, ACTIVE, SUSPENDED, INVITED
        default='ACTIVE'
    )

    # Verificación
    is_verified = models.BooleanField(default=True)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    verification_date = models.DateTimeField(blank=True, null=True)

    # Email único (USERNAME_FIELD)
    email = models.EmailField('email address', unique=True, blank=False)

    # Campos adicionales
    phone = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    # Relación de invitaciones
    invited_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invited_users'
    )
    invitation_accepted = models.BooleanField(default=True)

    # Auditoría de seguridad
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
```

**Estados de usuario (`USER_STATES`):**

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Pendiente de verificación o activación |
| `ACTIVE` | Usuario activo |
| `SUSPENDED` | Usuario suspendido |
| `INVITED` | Creado por invitación, pendiente de flujo |

**Métodos relevantes:**

| Método | Descripción |
|--------|-------------|
| `can_accept_invitations()` | Verifica si el usuario puede enviar invitaciones |
| `is_locked()` | Comprueba si la cuenta está bloqueada |
| `increment_login_attempts()` | Incrementa el contador de intentos fallidos |
| `reset_login_attempts()` | Reinicia el contador de intentos |
| `generate_verification_token()` | Genera token para verificación de email |
| `activate()` | Activa la cuenta del usuario |
| `accept_invitation(invitation_token)` | Enlaza el usuario con una invitación |

---

### 3.2 Invitaciones — `authentication.models.Invitation`

| Campo | Descripción |
|-------|-------------|
| `token` | Slug único de la invitación |
| `inviter` | FK a `User` |
| `email`, `first_name`, `last_name`, `organization` | Datos del invitado |
| `state` | `PENDING`, `ACCEPTED`, `EXPIRED`, `CANCELLED` |
| `expires_at` | Expiración (por defecto 7 días) |

**Métodos:** `is_expired()`, `is_valid()`, `expire()`, `cancel()`, `accept(user)`.

---

### 3.3 Auditoría de Usuario — `authentication.models.UserActivity`

Registra actividades del sistema: `LOGIN`, `LOGOUT`, `LOGIN_FAILED`, `INVITATION_SENT`, entre otras.

| Campo | Descripción |
|-------|-------------|
| `user` | FK a `User` |
| `activity_type` | Tipo de actividad registrada |
| `description` | Descripción del evento |
| `ip_address` | IP desde donde se realizó la acción |
| `user_agent` | Agente de usuario del navegador |
| `created_at` | Fecha y hora del evento |

---

### 3.4 Solicitudes de Acceso — `authentication.models.AdminRequest`

Usado para el flujo de "solicitar acceso" desde el frontend.

| Campo | Descripción |
|-------|-------------|
| `email`, `first_name`, `last_name` | Datos del solicitante |
| `affiliation`, `justification`, `phone` | Información adicional |
| `status` | `pending`, `approved`, `rejected` |
| `created_at`, `reviewed_at` | Fechas de creación y revisión |
| `reviewed_by` | FK al usuario administrador revisor |
| `review_notes` | Notas de la revisión |

---

### 3.5 Consultas / Procesamientos — `authentication.models.Query`

Representa un archivo o consulta que puede generar árboles y estadísticas (diseñado para procesamientos avanzados).

| Campo | Descripción |
|-------|-------------|
| `user` | FK a `User` |
| `title`, `description` | Metadatos de la consulta |
| `data_file` | Archivo de datos |
| `processing_state` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `tree_data`, `stats` | Resultado en JSON |
| `created_at`, `updated_at`, `processed_at` | Fechas de ciclo de vida |

---

### 3.6 Bibliografías — `bibliography.models.Bibliography`

```python
class Bibliography(models.Model):
    nombre_archivo = models.CharField(max_length=255)
    archivo = models.FileField(upload_to='bibliography/')
    fecha_subida = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bibliographies'
    )
```

Cada bibliografía pertenece a un usuario. Se almacena el archivo junto con metadatos básicos de subida.

---

### 3.7 Árboles de la Ciencia — `trees.models.Tree`

```python
class Tree(models.Model):
    arbol_json = models.JSONField()
    fecha_generado = models.DateTimeField(auto_now_add=True)
    bibliography = models.ForeignKey(
        Bibliography,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='trees'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trees'
    )
    seed = models.TextField(help_text="Semilla utilizada para generar el árbol")
    title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Título del árbol generado"
    )
```

El campo `arbol_json` contiene:

```json
{
  "nodes": [
    {
      "label": "...",
      "year": 2021,
      "type_label": "trunk",
      "_sap": 0.85,
      "times_cited": 34
    }
  ],
  "statistics": {
    "roots": 5,
    "trunks": 12,
    "leaves": 28,
    "average_sap": 0.61,
    "max_sap": 0.98,
    "min_sap": 0.12
  }
}
```

---

## 4. API Backend

> Las rutas a continuación son relativas al prefijo configurado en `tree_of_science/urls.py` (por ejemplo `/api/`).

---

### 4.1 Autenticación — `authentication/urls.py`

#### Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/register/` | Registro de usuario (acepta `invitation_token` opcional). Devuelve `user`, `access`, `refresh`. |
| `POST` | `/auth/login/` | Inicio de sesión con `email` y `password`. Valida estado, bloqueo y verificación. |
| `POST` | `/auth/logout/` | Cierre de sesión (registra actividad; JWT es stateless). |
| `POST` | `/auth/refresh-token/` | Renueva el token de acceso usando `TokenRefreshView`. |
| `POST` | `/auth/verify-email/` | Verifica correo con `verification_token`. Activa cuenta y genera nuevos tokens. |

**Validaciones en `/auth/login/`:**
- Cuenta no bloqueada (`is_locked`).
- `user_state` debe ser `ACTIVE` o `INVITED`.
- `is_verified = True`.
- `invitation_accepted = True`.

#### Recuperación de contraseña

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/forgot-password/` | Envía enlace de recuperación al email si el usuario está `ACTIVE`. |
| `POST` | `/auth/reset-password/` | Restablece contraseña con `token`, `user_id` y `new_password`. |

El enlace generado tiene la forma:

```
http://localhost:5173/reset-password?token=<token>&user_id=<id>
```

#### Invitaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/invitations/validate/` | Valida token de invitación. Devuelve datos básicos (email, nombre). |
| `POST` | `/auth/invitations/send/` | Envía invitación (requiere `can_accept_invitations() = True`). |
| `GET` | `/auth/invitations/my/` | Lista invitaciones enviadas por el usuario autenticado. |
| `GET` | `/auth/admin/invitations/` | Lista invitaciones (admin ve todas; usuario ve las propias no canceladas). Incluye contadores por estado. |
| `POST` | `/auth/admin/invitations/<id>/` | Revoca la invitación → la marca como `CANCELLED`. |

#### Perfil y actividad

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/auth/profile/` | Datos del usuario autenticado. |
| `PUT` | `/auth/profile/` | Actualiza campos permitidos (nombre, teléfono, etc.). |
| `GET` | `/auth/profile/activities/` | Últimas 50 actividades (`UserActivity`) del usuario. |

#### Administración de usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/auth/admin/users/` | Lista de usuarios. Filtros: `search`, `status`, `state`, `role`. |
| `GET` | `/auth/admin/users/<user_id>/` | Detalle de usuario. |
| `PUT` | `/auth/admin/users/<user_id>/` | Actualización básica (nombre, `is_staff`). |
| `DELETE` | `/auth/admin/users/<user_id>/delete/` | Elimina usuario (no puede eliminarse a sí mismo). |
| `POST` | `/auth/admin/users/<user_id>/activate/` | Activa usuario y registra actividad. |
| `POST` | `/auth/admin/users/<user_id>/suspend/` | Suspende usuario (`user_state = SUSPENDED`, `is_active = False`, `is_verified = False`). |

#### Solicitudes de acceso — `AdminRequest`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/request-admin/` | Crea solicitud de acceso con datos de contacto y justificación. |
| `GET` | `/auth/admin/requests/` | Lista solicitudes. Filtros: `status`, `search`. Incluye contadores por estado. |
| `PATCH` | `/auth/admin/requests/<request_id>/review/` | Revisa solicitud (`approved` o `rejected`). Si se aprueba, crea automáticamente una `Invitation` y envía correo. |

---

### 4.2 Bibliografías — `bibliography/urls.py`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/bibliography/list/` | Lista bibliografías del usuario autenticado. |
| `POST` | `/bibliography/upload/` | Subida de archivo (`MultiPartParser`, `FormParser`). Valida tipos admitidos y asocia al `request.user`. |
| `GET` | `/bibliography/download/<id>/` | Descarga el archivo (`application/octet-stream`). |
| `DELETE` | `/bibliography/delete/<id>/` | Elimina bibliografía del usuario. |

---

### 4.3 Árboles de la Ciencia — `trees/urls.py`

#### Generación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/trees/generate/` | Crea un nuevo árbol de la ciencia. |

**Cuerpo de la petición:**

```json
{
  "seed": "Inteligencia artificial en medicina",
  "title": "Mi árbol de IA médica",
  "bibliography_id": 3
}
```

> `seed` es obligatorio. `title` y `bibliography_id` son opcionales.

#### Historial

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/trees/history/` | Historial paginado, ordenado por `fecha_generado DESC`. Soporta `?search=` y `?page_size=`. |

#### Detalle

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/trees/<id>/` | Detalles completos del árbol (solo si pertenece al usuario). |

#### Descarga

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/trees/<id>/download/json/` | Descarga `arbol_json` identado como `application/json`. |
| `GET` | `/trees/<id>/download/pdf/` | Genera y descarga un PDF tabular del árbol. |

**Contenido del PDF generado:**
- Cabecera del árbol: título, semilla, fecha, bibliografía asociada.
- Resumen de estadísticas: `roots`, `trunks`, `leaves`, `average_sap`, `max_sap`, `min_sap`.
- Tabla de nodos: título (con wrap de texto), año, tipo, SAP, citas.
- Paginación automática.

> Cualquier formato distinto de `json` o `pdf` devuelve `400 Bad Request`.

#### Eliminación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `DELETE` | `/trees/<id>/delete/` | Elimina el árbol si pertenece al usuario autenticado. |

---

## 5. Configuración y Ejecución

### 5.1 Variables de entorno

Crear el archivo `tree_of_science/.env` con el siguiente contenido mínimo:

```env
CORREO=tu_correo@gmail.com
PASSWORD=tu_contraseña_de_aplicacion
```

Estas variables se usan en `settings.py` como `EMAIL_HOST_USER` y `EMAIL_HOST_PASSWORD`.

> ⚠️ `PASSWORD` debe ser una [contraseña de aplicación de Gmail](https://support.google.com/accounts/answer/185833), no la contraseña normal de la cuenta.

### 5.2 Django REST Framework y JWT

Configurados en `tree_of_science/settings.py`:

- **Autenticación por defecto:** `JWTAuthentication`.
- **Permiso por defecto:** `IsAuthenticated`.
- **Formato de respuesta:** JSON.
- **Paginación:** por página (configurable en `settings.py`).

---

## 6. Seguridad

### 6.1 Medidas implementadas

| Medida | Descripción |
|--------|-------------|
| JWT | Autenticación stateless con tokens de acceso y refresco |
| Verificación de email | Obligatoria antes de permitir el primer login |
| Bloqueo de cuenta | Por intentos fallidos (`login_attempts`, `locked_until`) |
| Estados de usuario | `user_state` controla el acceso al sistema |
| Roles | Diferenciación por `is_staff` e `is_superuser` |
| Auditoría | Registro completo con `UserActivity` |
| Invitaciones con expiración | Caducan automáticamente a los 7 días |
| CORS | Configurado para entornos de desarrollo (`CORS_ALLOW_ALL_ORIGINS = True` solo en dev) |

### 6.2 Consideraciones para producción

Antes de desplegar en producción, asegúrate de:

- Configurar `SECRET_KEY` vía variable de entorno.
- Deshabilitar `DEBUG = False`.
- Especificar `ALLOWED_HOSTS` con los dominios reales.
- Migrar la base de datos a **PostgreSQL**.
- Configurar **HTTPS** y un reverse proxy (Nginx / Caddy).
- Ajustar `CORS_ALLOWED_ORIGINS` con los dominios del frontend.
- Establecer límites de subida de archivos y **rate limiting**.
- Activar logging y monitoreo de errores.

---

## 7. Testing y Cobertura Funcional

A nivel funcional, el sistema cubre los siguientes flujos:

- Registro con invitaciones y verificación de email.
- Inicio de sesión con control de estado y bloqueo de cuenta.
- Recuperación y restablecimiento de contraseña.
- Gestión de bibliografías (subida, descarga, eliminación).
- Generación, listado, descarga y eliminación de árboles.
- Flujo completo de invitaciones (envío, validación, aceptación, revocación).
- Flujo de solicitudes de acceso (creación, revisión, aprobación/rechazo).

---

## 8. Soporte y Contacto

Para soporte técnico o consultas sobre la implementación, contactar al equipo de desarrollo de la **Universidad Nacional de Colombia**.

---

*Documentación Técnica — Árbol de la Ciencia UNAL · Versión 1.0 · Febrero 2026*
