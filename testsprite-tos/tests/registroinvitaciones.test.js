// tests/02_registro_invitaciones.test.js
// ─────────────────────────────────────────────────────────────
// Flujos de registro con invitación y gestión de invitaciones.
// ─────────────────────────────────────────────────────────────

import { test, expect } from "testsprite";

// ──────────────────────────────────────────
// BLOQUE 1 — Registro con token de invitación
// ──────────────────────────────────────────

test("REG-01 | Registro exitoso con token de invitación válido", {
  steps: [
    "Navegar a la URL de invitación http://localhost:5173/register?token=TOKEN_INVITACION_VALIDO",
    "Verificar que el formulario de registro está visible",
    "Verificar que el email ya está pre-rellenado con el email del invitado",
    "Completar el campo 'Nombre' con 'Juan'",
    "Completar el campo 'Apellido' con 'Pérez'",
    "Completar el campo 'Usuario' con 'jperez2025'",
    "Completar el campo 'Contraseña' con 'MiContraseña123!'",
    "Completar el campo 'Confirmar contraseña' con 'MiContraseña123!'",
    "Hacer clic en el botón 'Registrarse'",
    "Verificar que aparece un mensaje indicando que se debe verificar el correo electrónico",
  ],
});

test("REG-02 | Registro con token de invitación expirado", {
  steps: [
    "Navegar a http://localhost:5173/register?token=TOKEN_EXPIRADO",
    "Verificar que aparece un mensaje indicando que la invitación ha expirado o es inválida",
    "Verificar que el formulario de registro NO está disponible",
  ],
});

test("REG-03 | Registro con token de invitación ya utilizado", {
  steps: [
    "Navegar a http://localhost:5173/register?token=TOKEN_YA_ACEPTADO",
    "Verificar que aparece un mensaje indicando que la invitación ya fue utilizada",
    "Verificar que el formulario de registro NO está disponible",
  ],
});

test("REG-04 | Validaciones del formulario de registro — campos requeridos", {
  steps: [
    "Navegar a http://localhost:5173/register?token=TOKEN_VALIDO",
    "Dejar todos los campos vacíos y hacer clic en 'Registrarse'",
    "Verificar que aparecen mensajes de validación en cada campo requerido",
    "Verificar que NO se realiza ninguna petición al servidor",
  ],
});

test("REG-05 | Validación de contraseña débil en el registro", {
  steps: [
    "Navegar a http://localhost:5173/register?token=TOKEN_VALIDO",
    "Completar todos los campos correctamente",
    "Ingresar '123' como contraseña",
    "Hacer clic en 'Registrarse'",
    "Verificar que aparece un mensaje indicando que la contraseña no cumple los requisitos mínimos",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 2 — Verificación de email
// ──────────────────────────────────────────

test("REG-06 | Verificación de email con token válido", {
  steps: [
    "Navegar a http://localhost:5173/verify-email?token=TOKEN_VERIFICACION_VALIDO",
    "Verificar que aparece un mensaje de éxito indicando que el email fue verificado",
    "Verificar que se puede iniciar sesión con las credenciales registradas",
  ],
});

test("REG-07 | Verificación de email con token inválido o expirado", {
  steps: [
    "Navegar a http://localhost:5173/verify-email?token=TOKEN_INVALIDO",
    "Verificar que aparece un mensaje de error indicando que el token no es válido o ha expirado",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 3 — Solicitud de acceso (AdminRequest)
// ──────────────────────────────────────────

test("REG-08 | Solicitud de acceso al sistema completada correctamente", {
  steps: [
    "Navegar a http://localhost:5173",
    "Hacer clic en el enlace 'Solicitar acceso' o 'Request access'",
    "Completar el campo 'Nombre' con 'Ana'",
    "Completar el campo 'Apellido' con 'García'",
    "Completar el campo 'Email' con 'ana.garcia@unal.edu.co'",
    "Completar el campo 'Afiliación' con 'Universidad Nacional de Colombia'",
    "Completar el campo 'Justificación' con 'Necesito acceso para mi investigación doctoral'",
    "Hacer clic en el botón 'Enviar solicitud'",
    "Verificar que aparece un mensaje de confirmación de que la solicitud fue recibida",
  ],
});

test("REG-09 | Solicitud de acceso con email ya registrado en el sistema", {
  steps: [
    "Navegar al formulario de solicitud de acceso",
    "Completar todos los campos con un email que ya existe en el sistema",
    "Hacer clic en 'Enviar solicitud'",
    "Verificar que aparece un mensaje apropiado (error o aviso de email duplicado)",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 4 — Gestión de invitaciones (usuario autenticado)
// ──────────────────────────────────────────

test("REG-10 | Usuario autorizado puede enviar una invitación", {
  steps: [
    "Iniciar sesión como administrador con 'admin@unal.edu.co' y 'AdminPass123!'",
    "Navegar a la sección de invitaciones o gestión de usuarios",
    "Hacer clic en 'Enviar invitación' o botón equivalente",
    "Completar el email del invitado con 'nuevo.investigador@unal.edu.co'",
    "Completar el nombre con 'Carlos'",
    "Completar el apellido con 'López'",
    "Hacer clic en el botón de enviar",
    "Verificar que aparece un mensaje de éxito confirmando el envío de la invitación",
    "Verificar que la invitación aparece en la lista de invitaciones enviadas",
  ],
});

test("REG-11 | Administrador puede ver el listado de todas las invitaciones", {
  steps: [
    "Iniciar sesión como administrador",
    "Navegar a la sección de administración de invitaciones",
    "Verificar que se muestra la lista de invitaciones con sus estados (PENDING, ACCEPTED, EXPIRED, CANCELLED)",
    "Verificar que se muestran los contadores por estado",
  ],
});

test("REG-12 | Administrador puede revocar una invitación pendiente", {
  steps: [
    "Iniciar sesión como administrador",
    "Navegar a la sección de invitaciones",
    "Localizar una invitación con estado PENDING",
    "Hacer clic en el botón de revocar o cancelar invitación",
    "Confirmar la acción en el diálogo de confirmación",
    "Verificar que la invitación cambia a estado CANCELLED",
    "Verificar que aparece un mensaje de éxito",
  ],
});