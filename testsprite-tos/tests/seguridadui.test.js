// tests/06_seguridad_ui.test.js
// ─────────────────────────────────────────────────────────────
// Pruebas de seguridad (JWT, tokens), comportamiento de la UI
// y experiencia general de usuario.
// ─────────────────────────────────────────────────────────────

import { test, expect } from "testsprite";

// ──────────────────────────────────────────
// BLOQUE 1 — Seguridad de sesión y tokens JWT
// ──────────────────────────────────────────

test("SEC-01 | Las peticiones API sin token son rechazadas con 401", {
  steps: [
    "Sin iniciar sesión, enviar una petición GET directamente a http://localhost:8000/trees/history/",
    "Verificar que el servidor responde con código de estado 401 (Unauthorized)",
    "Verificar que NO se devuelven datos del usuario en la respuesta",
  ],
});

test("SEC-02 | Las peticiones con token de otro usuario son rechazadas", {
  steps: [
    "Iniciar sesión con 'usuario.test@unal.edu.co' y obtener el token JWT",
    "Intentar acceder a /trees/ID_ARBOL_USUARIO_2/ usando el token del primer usuario",
    "Verificar que el servidor responde con 403 o 404",
  ],
});

test("SEC-03 | El token JWT se renueva correctamente con refresh token", {
  steps: [
    "Iniciar sesión con 'usuario.test@unal.edu.co' y 'UserPass123!'",
    "Verificar que se reciben tanto el access token como el refresh token",
    "Simular la expiración del access token",
    "Verificar que la aplicación solicita automáticamente un nuevo token usando el refresh token",
    "Verificar que el usuario no es forzado a hacer login nuevamente",
  ],
});

test("SEC-04 | Al cerrar sesión el token queda invalidado", {
  steps: [
    "Iniciar sesión con 'usuario.test@unal.edu.co' y 'UserPass123!'",
    "Cerrar sesión",
    "Intentar acceder al dashboard directamente",
    "Verificar que el usuario es redirigido a la página de login",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 2 — Comportamiento de UI y navegación
// ──────────────────────────────────────────

test("UI-01 | La aplicación carga correctamente en el navegador", {
  steps: [
    "Navegar a http://localhost:5173",
    "Verificar que la página carga sin errores de JavaScript en la consola",
    "Verificar que el formulario de login o la pantalla principal es visible",
    "Verificar que no hay pantallas en blanco ni errores de red",
  ],
});

test("UI-02 | La navegación entre secciones funciona sin recargar la página (SPA)", {
  steps: [
    "Iniciar sesión con 'usuario.test@unal.edu.co' y 'UserPass123!'",
    "Navegar a la sección 'Bibliografía'",
    "Verificar que la URL cambia pero la página no se recarga completamente",
    "Navegar a la sección 'Generar Árbol'",
    "Verificar que la URL cambia y la sección es visible",
    "Navegar a la sección 'Historial'",
    "Verificar que la URL cambia y el historial es visible",
    "En ninguno de los pasos debería haber recarga completa de la página",
  ],
});

test("UI-03 | Los estados de carga se muestran mientras se procesan peticiones", {
  steps: [
    "Iniciar sesión con 'usuario.test@unal.edu.co' y 'UserPass123!'",
    "Navegar a la sección 'Generar Árbol'",
    "Ingresar 'Computación cuántica' como semilla",
    "Hacer clic en 'Generar Árbol de la Ciencia'",
    "Verificar que aparece un indicador de carga (spinner, barra de progreso o skeleton) mientras se genera el árbol",
    "Verificar que el botón de generar se deshabilita durante la generación para evitar múltiples peticiones",
  ],
});

test("UI-04 | Los mensajes de error de API son comprensibles para el usuario", {
  steps: [
    "Detener el servidor backend (http://localhost:8000)",
    "Iniciar sesión en el frontend (http://localhost:5173)",
    "Intentar generar un árbol de la ciencia",
    "Verificar que aparece un mensaje de error amigable al usuario (no un stack trace técnico)",
    "Verificar que el error explica que el servicio no está disponible o que ocurrió un problema",
  ],
});

test("UI-05 | El diseño es responsivo en pantallas móviles", {
  steps: [
    "Abrir http://localhost:5173 en viewport de 375x812 (tamaño iPhone)",
    "Verificar que el formulario de login es visible y usable",
    "Iniciar sesión",
    "Verificar que la navegación principal es accesible (menú hamburguesa o equivalente)",
    "Navegar a las diferentes secciones y verificar que el contenido se adapta correctamente",
  ],
});

test("UI-06 | Las tablas y listas tienen comportamiento correcto con muchos datos", {
  steps: [
    "Iniciar sesión con un usuario que tiene más de 20 árboles y bibliografías",
    "Navegar a la sección 'Historial'",
    "Verificar que la lista carga correctamente sin bloquear la interfaz",
    "Verificar que los controles de paginación funcionan correctamente",
    "Navegar a la sección 'Bibliografía'",
    "Verificar que la lista de archivos carga correctamente",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 3 — Validaciones de formularios
// ──────────────────────────────────────────

test("UI-07 | Los formularios muestran validaciones en tiempo real", {
  steps: [
    "Navegar a http://localhost:5173",
    "Ingresar un email con formato inválido (ej: 'usuario@@dominio')",
    "Hacer clic fuera del campo de email",
    "Verificar que aparece inmediatamente un mensaje de validación de formato",
    "Corregir el email con un formato válido",
    "Verificar que el mensaje de error desaparece",
  ],
});

test("UI-08 | El campo de contraseña puede ocultar y mostrar el texto", {
  steps: [
    "Navegar a http://localhost:5173",
    "Ingresar una contraseña en el campo de contraseña",
    "Verificar que el texto está oculto (tipo password)",
    "Hacer clic en el ícono de ojo para mostrar la contraseña",
    "Verificar que el texto de la contraseña es visible",
    "Hacer clic nuevamente en el ícono para volver a ocultar",
    "Verificar que el texto vuelve a estar oculto",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 4 — Accesibilidad básica
// ──────────────────────────────────────────

test("ACC-01 | Los formularios son navegables con teclado (Tab)", {
  steps: [
    "Navegar a http://localhost:5173",
    "Usar la tecla Tab para navegar entre los campos del formulario de login",
    "Verificar que el foco se mueve correctamente de email a contraseña",
    "Verificar que el botón de login puede ser activado con la tecla Enter",
  ],
});

test("ACC-02 | El formulario de login se puede enviar presionando Enter", {
  steps: [
    "Navegar a http://localhost:5173",
    "Ingresar email y contraseña válidos",
    "Presionar la tecla Enter desde el campo de contraseña",
    "Verificar que el formulario se envía correctamente sin necesidad de hacer clic en el botón",
  ],
});