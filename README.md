# 🌳 Árbol de la Ciencia — Universidad Nacional de Colombia

Aplicación web para la generación y gestión de **árboles de conocimiento científico (Tree of Science)**, desarrollada para la Universidad Nacional de Colombia. Permite explorar, organizar y visualizar el conocimiento científico a partir de una semilla conceptual.

---

## ✨ Características

- **Generación de Árboles de la Ciencia** a partir de semillas conceptuales.
- **Gestión de Bibliografías**: subida y organización de archivos de referencia (PDF, DOC, DOCX, TXT).
- **Historial de árboles** generados por usuario con búsqueda y paginación.
- **Descarga en múltiples formatos**: JSON, PDF y CSV.
- **Interfaz moderna** con React + Tailwind CSS + shadcn/ui.
- **Autenticación segura** con JWT, verificación de correo, recuperación de contraseña e invitaciones.

---

## 🚀 Inicio rápido

### Prerrequisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Python | 3.11+ |
| Node.js | 22+ |
| pnpm | última estable |
| Git | cualquiera |

Instala `pnpm` si no lo tienes:

```bash
npm install -g pnpm
```

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/akunot/tree_of_science.git
cd tree_of_science
```

---

### 2. Configurar variables de entorno (Backend)

Dentro de la carpeta `tree_of_science/` (donde está `manage.py`), crea un archivo `.env`:

```env
# Correo usado para envío de verificación, recuperación e invitaciones
CORREO=tu_correo@gmail.com

# Contraseña de aplicación de Gmail (NO tu contraseña normal de cuenta)
PASSWORD=tu_contraseña_de_aplicacion
```

> ⚠️ **Importante:** `PASSWORD` debe ser una [contraseña de aplicación de Gmail](https://support.google.com/accounts/answer/185833), no tu contraseña habitual.

---

### 3. Instalar y ejecutar el Backend (Django)

Desde la carpeta `tree_of_science/` (donde está `manage.py`):

```bash
# (Recomendado) Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate      # Linux / Mac
venv\Scripts\activate         # Windows

# Descargar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# (Opcional) Crear superusuario para el panel admin
python manage.py createsuperuser

# Ejecutar servidor de desarrollo
python manage.py runserver 0.0.0.0:8000

```

| Servicio | URL |
|----------|-----|
| API Backend | http://localhost:8000 |
| Panel Admin Django | http://localhost:8000/admin |

---

### 4. Instalar y ejecutar el Frontend (React)

Desde la raíz del repositorio (hermana de `tree_of_science/`):

```bash
cd tos_frontend

pnpm install
pnpm run dev --host
```

El frontend estará disponible en **http://localhost:5173**.

> El frontend espera que la API esté en `http://localhost:8000`. Si cambias el puerto o host del backend, actualiza la URL base en la configuración del frontend.

---

## 📁 Estructura del proyecto

```
├── tree_of_science/          # Backend Django
│   ├── tree_of_science/      # Configuración principal (settings, urls, wsgi)
│   ├── authentication/       # Autenticación, usuarios e invitaciones
│   ├── bibliography/         # Gestión de bibliografías
│   ├── trees/                # Generación y gestión de árboles
│   └── manage.py
├── tos_frontend/             # Frontend React (Vite)
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── hooks/            # Hooks personalizados
│   │   ├── lib/              # Utilidades y clientes API
│   │   └── ...
│   └── package.json
├── documentacion_tecnica.md  # Documentación técnica completa
└── README.md
```

---

## 🛠 Stack tecnológico

### Backend

| Tecnología | Descripción |
|-----------|-------------|
| Django 5.2.6 | Framework principal |
| Django REST Framework | API REST |
| djangorestframework-simplejwt | Autenticación JWT |
| python-dotenv | Carga de variables de entorno |
| ReportLab | Generación de PDFs |
| SQLite / PostgreSQL | Base de datos |

### Frontend

| Tecnología | Descripción |
|-----------|-------------|
| React 19 | Biblioteca UI |
| Vite | Bundler y dev server |
| TanStack Query | Gestión de estado asíncrono |
| Tailwind CSS | Estilos utility-first |
| shadcn/ui | Componentes de UI |
| D3.js | Visualización del árbol |

---

## ⚙️ Configuración de base de datos

Por defecto se usa **SQLite** (sin configuración adicional):

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

Para usar **PostgreSQL**, reemplaza la configuración en `tree_of_science/settings.py`:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "nombre_bd",
        "USER": "usuario",
        "PASSWORD": "password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```

---

## 🔑 Autenticación y flujo de acceso

El sistema incluye autenticación JWT, verificación de correo, recuperación de contraseña e invitaciones controladas.

**Flujo principal (con invitación):**

```
Admin envía invitación → Usuario recibe email → Se registra con token de invitación
→ Verifica su email → Inicia sesión con JWT
```

**Flujo alternativo:**

```
Usuario solicita acceso → Admin revisa la solicitud → Aprueba o rechaza
```

---

## 📖 Uso desde la interfaz web

### 1. Registro e inicio de sesión
1. Usa el enlace de invitación recibido por correo.
2. Completa el formulario de registro.
3. Verifica tu email con el enlace enviado a tu correo.
4. Inicia sesión para acceder al sistema.

### 2. Generar un Árbol de la Ciencia
1. Ve a la sección **"Generar Árbol"**.
2. Ingresa una semilla conceptual (ej: `"Inteligencia artificial en medicina"`).
3. *(Opcional)* Agrega un título y selecciona una bibliografía cargada.
4. Haz clic en **"Generar Árbol de la Ciencia"**.
5. Descarga el árbol en **JSON** o **PDF**.

### 3. Gestionar bibliografías
1. Ve a la sección **"Bibliografía"**.
2. Arrastra y suelta archivos o usa el botón **"Seleccionar Archivo"**.
3. Descarga o elimina tus archivos cuando lo necesites.

### 4. Ver historial
En **"Historial"** puedes:
- Ver todos tus árboles generados.
- Buscar y filtrar por título, semilla o archivo de bibliografía.
- Descargar en JSON, PDF o CSV.
- Eliminar árboles.

---

## 🔧 API — Referencia rápida

> Las rutas exactas dependen de la configuración en `tree_of_science/urls.py`. Consulta `documentacion_tecnica.md` para el listado completo.

### Autenticación (`/auth/`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/register/` | Registro con token de invitación |
| `POST` | `/auth/login/` | Inicio de sesión → devuelve `access` y `refresh` JWT |
| `POST` | `/auth/logout/` | Cierre de sesión |
| `POST` | `/auth/refresh-token/` | Refresca el token de acceso |
| `POST` | `/auth/verify-email/` | Verificar email con token |
| `POST` | `/auth/forgot-password/` | Solicitar recuperación de contraseña |
| `POST` | `/auth/reset-password/` | Restablecer contraseña con token y `user_id` |

### Árboles de la Ciencia (`/trees/`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/trees/generate/` | Generar nuevo árbol |
| `GET` | `/trees/history/` | Historial del usuario (`?search=` · `?page_size=`) |
| `GET` | `/trees/<id>/` | Detalle de un árbol |
| `GET` | `/trees/<id>/download/<format>/` | Descarga en `json`, `pdf` o `csv` |
| `DELETE` | `/trees/<id>/delete/` | Eliminar árbol |

### Bibliografías (`/bibliography/`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/bibliography/list/` | Listar bibliografías del usuario |
| `POST` | `/bibliography/upload/` | Subir archivo (`multipart/form-data`) |
| `GET` | `/bibliography/download/<id>/` | Descargar un archivo |
| `DELETE` | `/bibliography/delete/<id>/` | Eliminar bibliografía |

---

## 🔒 Seguridad

- Autenticación basada en **JWT** configurada en `REST_FRAMEWORK`.
- Verificación de email y bloqueo de cuenta por intentos fallidos.
- Roles y estados de usuario (`user_state`).
- CORS configurado para desarrollo: `localhost:3000`, `127.0.0.1:3000`, `localhost:5173`.
- `CORS_ALLOW_ALL_ORIGINS = True` habilitado **solo para desarrollo**.
- Validación de tipos de archivo en la subida de bibliografía.

---

## 🤝 Contribución

Este proyecto fue desarrollado para la Universidad Nacional de Colombia. Para sugerencias o mejoras:

1. Crea un **fork** del repositorio.
2. Crea una rama de feature: `git checkout -b feature/mi-mejora`.
3. Realiza tus cambios y pruebas.
4. Crea un **Pull Request** describiendo los cambios.

---

## 📚 Documentación adicional

Para detalles sobre modelos, serializadores, permisos y flujos completos, revisa [`Documentación Técnica - Árbol de la Ciencia UNAL.md`](./Documentación Técnica - Árbol de la Ciencia UNAL.md).

---

## 🆘 Soporte

Para soporte técnico o consultas:
1. Revisa primero [`documentacion_tecnica.md`](./documentacion_tecnica.md).
2. Contacta al equipo de desarrollo de la **Universidad Nacional de Colombia**.

---

## 📄 Licencia

Desarrollado para la **Universidad Nacional de Colombia** — 2025.

---

<p align="center">Desarrollado con ❤️ para la Universidad Nacional de Colombia</p>
<p align="center">Hecho con ❤️ por <a href="https://github.com/akunot">akunot</a></p>
