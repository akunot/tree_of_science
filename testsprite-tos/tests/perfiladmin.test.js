// tests/05_perfil_admin.test.js
// ─────────────────────────────────────────────────────────────
// Flujos de perfil de usuario, gestión de usuarios por admin
// y revisión de solicitudes de acceso.
// ─────────────────────────────────────────────────────────────

import { test, expect } from "testsprite";

const loginUser = [
  "Navegar a http://localhost:5173",
  "Iniciar sesión con 'usuario.test@unal.edu.co' y 'UserPass123!'",
  "Verificar que el dashboard está visible",
];

const loginAdmin = [
  "Navegar a http://localhost:5173",
  "Iniciar sesión con 'admin@unal.edu.co' y 'AdminPass123!'",
  "Verificar que el dashboard de administrador está visible",
];

// ──────────────────────────────────────────
// BLOQUE 1 — Perfil de usuario
// ──────────────────────────────────────────

test("PERFIL-01 | El usuario puede ver su perfil con sus datos correctos", {
  steps: [
    ...loginUser,
    "Navegar a la sección de perfil del usuario",
    "Verificar que se muestran los datos del usuario: nombre, apellido, email",
    "Verificar que el email corresponde a 'usuario.test@unal.edu.co'",
  ],
});

test("PERFIL-02 | El usuario puede actualizar su nombre y teléfono", {
  steps: [
    ...loginUser,
    "Navegar a la sección de perfil",
    "Hacer clic en el botón de editar perfil",
    "Modificar el campo 'Teléfono' con '+573001234567'",
    "Modificar el campo 'Organización' con 'UNAL Medellín'",
    "Hacer clic en el botón 'Guardar cambios'",
    "Verificar que aparece un mensaje de éxito",
    "Verificar que los nuevos valores se reflejan en el perfil",
  ],
});

test("PERFIL-03 | El usuario puede ver su historial de actividad", {
  steps: [
    ...loginUser,
    "Navegar a la sección de perfil",
    "Navegar a la pestaña o sección de 'Actividad reciente'",
    "Verificar que se muestran actividades recientes del usuario (logins, generaciones de árboles)",
    "Verificar que cada actividad muestra: tipo, descripción y fecha",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 2 — Panel de administración: usuarios
// ──────────────────────────────────────────

test("ADMIN-01 | El administrador puede ver la lista completa de usuarios", {
  steps: [
    ...loginAdmin,
    "Navegar al panel de administración de usuarios",
    "Verificar que se muestra la lista de todos los usuarios del sistema",
    "Verificar que cada usuario muestra: nombre, email, estado y rol",
  ],
});

test("ADMIN-02 | El administrador puede buscar usuarios por nombre o email", {
  steps: [
    ...loginAdmin,
    "Navegar al panel de administración de usuarios",
    "Ingresar 'usuario.test' en el campo de búsqueda",
    "Verificar que los resultados se filtran correctamente",
    "Verificar que el usuario 'usuario.test@unal.edu.co' aparece en los resultados",
  ],
});

test("ADMIN-03 | El administrador puede filtrar usuarios por estado", {
  steps: [
    ...loginAdmin,
    "Navegar al panel de administración de usuarios",
    "Seleccionar el filtro 'SUSPENDED' en el selector de estado",
    "Verificar que solo se muestran usuarios suspendidos",
    "Seleccionar el filtro 'ACTIVE'",
    "Verificar que solo se muestran usuarios activos",
  ],
});

test("ADMIN-04 | El administrador puede ver el detalle de un usuario", {
  steps: [
    ...loginAdmin,
    "Navegar al panel de administración de usuarios",
    "Hacer clic en un usuario de la lista",
    "Verificar que se muestra el detalle completo del usuario",
    "Verificar que se muestran: nombre, email, estado, fecha de registro, intentos de login",
  ],
});

test("ADMIN-05 | El administrador puede suspender a un usuario activo", {
  steps: [
    ...loginAdmin,
    "Navegar al panel de administración de usuarios",
    "Localizar un usuario con estado ACTIVE",
    "Hacer clic en el botón 'Suspender usuario'",
    "Confirmar la acción en el diálogo de confirmación",
    "Verificar que el estado del usuario cambia a SUSPENDED",
    "Verificar que aparece un mensaje de éxito",
  ],
});

test("ADMIN-06 | El administrador puede activar a un usuario suspendido", {
  steps: [
    ...loginAdmin,
    "Navegar al panel de administración de usuarios",
    "Localizar un usuario con estado SUSPENDED",
    "Hacer clic en el botón 'Activar usuario'",
    "Confirmar la acción",
    "Verificar que el estado del usuario cambia a ACTIVE",
    "Verificar que aparece un mensaje de éxito",
  ],
});

test("ADMIN-07 | El administrador no puede eliminarse a sí mismo", {
  steps: [
    ...loginAdmin,
    "Navegar al panel de administración de usuarios",
    "Localizar el usuario administrador actual en la lista",
    "Verificar que el botón de eliminar no está disponible para el usuario propio",
    "O si está disponible, verificar que al intentar eliminar aparece un mensaje de error",
  ],
});

test("ADMIN-08 | El administrador puede eliminar a otro usuario", {
  steps: [
    ...loginAdmin,
    "Navegar al panel de administración de usuarios",
    "Localizar un usuario que NO sea el administrador actual",
    "Hacer clic en el botón 'Eliminar usuario'",
    "Confirmar la eliminación en el diálogo",
    "Verificar que el usuario desaparece de la lista",
    "Verificar que aparece un mensaje de éxito",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 3 — Solicitudes de acceso (admin)
// ──────────────────────────────────────────

test("ADMIN-09 | El administrador puede ver las solicitudes de acceso pendientes", {
  steps: [
    ...loginAdmin,
    "Navegar a la sección de solicitudes de acceso",
    "Verificar que se muestra la lista de solicitudes con sus estados",
    "Verificar que se muestran los contadores: pendientes, aprobadas, rechazadas",
  ],
});

test("ADMIN-10 | El administrador puede aprobar una solicitud de acceso", {
  steps: [
    ...loginAdmin,
    "Navegar a la sección de solicitudes de acceso",
    "Localizar una solicitud con estado 'pending'",
    "Hacer clic en el botón 'Aprobar'",
    "Verificar que aparece un mensaje de confirmación",
    "Confirmar la aprobación",
    "Verificar que el estado de la solicitud cambia a 'approved'",
    "Verificar que el sistema crea automáticamente una invitación para el solicitante",
  ],
});

test("ADMIN-11 | El administrador puede rechazar una solicitud de acceso", {
  steps: [
    ...loginAdmin,
    "Navegar a la sección de solicitudes de acceso",
    "Localizar una solicitud con estado 'pending'",
    "Hacer clic en el botón 'Rechazar'",
    "Ingresar una nota de revisión (opcional)",
    "Confirmar el rechazo",
    "Verificar que el estado de la solicitud cambia a 'rejected'",
  ],
});

test("ADMIN-12 | El administrador puede filtrar solicitudes por estado", {
  steps: [
    ...loginAdmin,
    "Navegar a la sección de solicitudes de acceso",
    "Seleccionar el filtro 'pending' en el selector de estado",
    "Verificar que solo se muestran solicitudes pendientes",
    "Seleccionar el filtro 'approved'",
    "Verificar que solo se muestran solicitudes aprobadas",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 4 — Control de acceso por roles
// ──────────────────────────────────────────

test("ADMIN-13 | Usuario regular no puede acceder al panel de administración", {
  steps: [
    ...loginUser,
    "Intentar navegar directamente a la sección de administración de usuarios",
    "Verificar que el sistema redirige o muestra un mensaje de acceso no autorizado",
    "Verificar que el menú de administración no es visible para el usuario regular",
  ],
});

test("ADMIN-14 | Usuario regular no puede ver las solicitudes de acceso", {
  steps: [
    ...loginUser,
    "Intentar navegar directamente a la sección de solicitudes de acceso admin",
    "Verificar que el sistema responde con acceso denegado",
  ],
});