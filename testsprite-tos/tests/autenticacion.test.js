// tests/01_autenticacion.test.js
// ─────────────────────────────────────────────────────────────
// Flujos de autenticación: login, logout, bloqueo de cuenta,
// recuperación de contraseña y verificación de email.
// ─────────────────────────────────────────────────────────────

import { test, expect } from "testsprite";

// ──────────────────────────────────────────
// BLOQUE 1 — Inicio de sesión
// ──────────────────────────────────────────

test("AUTH-01 | Login exitoso con credenciales válidas", {
  steps: [
    "Navegar a http://localhost:5173",
    "Verificar que la página de login es visible",
    "Ingresar el email 'usuario.test@unal.edu.co' en el campo de correo",
    "Ingresar la contraseña 'UserPass123!' en el campo de contraseña",
    "Hacer clic en el botón 'Iniciar sesión'",
    "Verificar que se redirige al dashboard principal",
    "Verificar que el nombre del usuario aparece en la interfaz",
  ],
});

test("AUTH-02 | Login fallido con contraseña incorrecta", {
  steps: [
    "Navegar a http://localhost:5173",
    "Ingresar el email 'usuario.test@unal.edu.co' en el campo de correo",
    "Ingresar la contraseña 'ContraseñaIncorrecta' en el campo de contraseña",
    "Hacer clic en el botón 'Iniciar sesión'",
    "Verificar que aparece un mensaje de error de credenciales inválidas",
    "Verificar que el usuario NO es redirigido al dashboard",
  ],
});

test("AUTH-03 | Login con email inexistente en el sistema", {
  steps: [
    "Navegar a http://localhost:5173",
    "Ingresar el email 'noexiste@unal.edu.co' en el campo de correo",
    "Ingresar cualquier contraseña",
    "Hacer clic en el botón 'Iniciar sesión'",
    "Verificar que aparece un mensaje de error indicando que el usuario no existe o las credenciales son inválidas",
  ],
});

test("AUTH-04 | Login con campo de email vacío", {
  steps: [
    "Navegar a http://localhost:5173",
    "Dejar el campo de email vacío",
    "Ingresar cualquier contraseña",
    "Hacer clic en el botón 'Iniciar sesión'",
    "Verificar que aparece un mensaje de validación en el campo de email",
    "Verificar que NO se realiza ninguna petición al servidor",
  ],
});

test("AUTH-05 | Login con email en formato inválido", {
  steps: [
    "Navegar a http://localhost:5173",
    "Ingresar 'esto-no-es-un-email' en el campo de correo",
    "Ingresar cualquier contraseña",
    "Hacer clic en el botón 'Iniciar sesión'",
    "Verificar que aparece un mensaje de validación de formato de email",
  ],
});

test("AUTH-06 | Bloqueo de cuenta tras múltiples intentos fallidos", {
  steps: [
    "Navegar a http://localhost:5173",
    "Intentar iniciar sesión 5 veces consecutivas con contraseña incorrecta para el email 'usuario.test@unal.edu.co'",
    "Verificar que en el último intento aparece un mensaje indicando que la cuenta ha sido bloqueada",
    "Verificar que los intentos adicionales de login muestran el mensaje de cuenta bloqueada",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 2 — Cierre de sesión
// ──────────────────────────────────────────

test("AUTH-07 | Logout exitoso y redirección a login", {
  steps: [
    "Navegar a http://localhost:5173",
    "Iniciar sesión con 'usuario.test@unal.edu.co' y 'UserPass123!'",
    "Verificar que el dashboard está visible",
    "Hacer clic en el botón o menú de cerrar sesión",
    "Verificar que se redirige a la página de login",
    "Verificar que el usuario no puede acceder al dashboard sin autenticarse nuevamente",
  ],
});

test("AUTH-08 | Rutas protegidas redirigen a login cuando no hay sesión", {
  steps: [
    "Sin iniciar sesión, navegar directamente a http://localhost:5173/dashboard",
    "Verificar que la aplicación redirige automáticamente a la página de login",
    "Sin iniciar sesión, navegar directamente a http://localhost:5173/trees",
    "Verificar que la aplicación redirige automáticamente a la página de login",
    "Sin iniciar sesión, navegar directamente a http://localhost:5173/bibliography",
    "Verificar que la aplicación redirige automáticamente a la página de login",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 3 — Recuperación de contraseña
// ──────────────────────────────────────────

test("AUTH-09 | Solicitud de recuperación de contraseña con email válido", {
  steps: [
    "Navegar a http://localhost:5173",
    "Hacer clic en el enlace '¿Olvidaste tu contraseña?' o 'Recuperar contraseña'",
    "Verificar que se muestra el formulario de recuperación de contraseña",
    "Ingresar 'usuario.test@unal.edu.co' en el campo de email",
    "Hacer clic en el botón de enviar",
    "Verificar que aparece un mensaje de confirmación indicando que se envió el enlace de recuperación",
  ],
});

test("AUTH-10 | Solicitud de recuperación con email inexistente", {
  steps: [
    "Navegar a http://localhost:5173",
    "Hacer clic en el enlace de recuperación de contraseña",
    "Ingresar 'noexiste@unal.edu.co' en el campo de email",
    "Hacer clic en el botón de enviar",
    "Verificar que el sistema responde con un mensaje genérico (por seguridad, no debería revelar si el email existe)",
  ],
});

test("AUTH-11 | Restablecimiento de contraseña con token válido", {
  steps: [
    "Navegar a http://localhost:5173/reset-password?token=TOKEN_VALIDO&user_id=1",
    "Verificar que se muestra el formulario de restablecimiento de contraseña",
    "Ingresar 'NuevaContraseña123!' en el campo de nueva contraseña",
    "Ingresar 'NuevaContraseña123!' en el campo de confirmar contraseña",
    "Hacer clic en el botón de restablecer contraseña",
    "Verificar que aparece un mensaje de éxito",
    "Verificar que se redirige a la página de login",
  ],
});

test("AUTH-12 | Validación de contraseñas no coincidentes en restablecimiento", {
  steps: [
    "Navegar a http://localhost:5173/reset-password?token=TOKEN_VALIDO&user_id=1",
    "Ingresar 'NuevaContraseña123!' en el campo de nueva contraseña",
    "Ingresar 'ContraseñaDiferente456!' en el campo de confirmar contraseña",
    "Hacer clic en el botón de restablecer contraseña",
    "Verificar que aparece un mensaje de error indicando que las contraseñas no coinciden",
  ],
});