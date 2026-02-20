// tests/04_arboles_ciencia.test.js
// ─────────────────────────────────────────────────────────────
// Flujos de generación, visualización, descarga y eliminación
// de árboles de la ciencia.
// ─────────────────────────────────────────────────────────────

import { test, expect } from "testsprite";

const loginStep = [
  "Navegar a http://localhost:5173",
  "Iniciar sesión con 'usuario.test@unal.edu.co' y 'UserPass123!'",
  "Verificar que el dashboard está visible",
];

// ──────────────────────────────────────────
// BLOQUE 1 — Generación de árboles
// ──────────────────────────────────────────

test("TREE-01 | Generación exitosa de árbol con semilla obligatoria", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Generar Árbol'",
    "Verificar que el formulario de generación está visible",
    "Ingresar 'Inteligencia artificial en medicina' en el campo de semilla conceptual",
    "Hacer clic en el botón 'Generar Árbol de la Ciencia'",
    "Verificar que aparece un indicador de carga o progreso mientras se genera el árbol",
    "Verificar que el árbol generado es visible en la interfaz",
    "Verificar que el árbol muestra los nodos raíz, tronco y hojas",
  ],
});

test("TREE-02 | Generación de árbol con título y bibliografía opcionales", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Generar Árbol'",
    "Ingresar 'Machine Learning en educación' en el campo de semilla",
    "Ingresar 'Mi árbol de ML educativo' en el campo de título",
    "Seleccionar una bibliografía disponible en el selector de bibliografías",
    "Hacer clic en 'Generar Árbol de la Ciencia'",
    "Verificar que el árbol se genera correctamente",
    "Verificar que el título y la bibliografía asociada aparecen en el detalle del árbol",
  ],
});

test("TREE-03 | Error al generar árbol sin ingresar semilla (campo requerido)", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Generar Árbol'",
    "Dejar el campo de semilla vacío",
    "Hacer clic en 'Generar Árbol de la Ciencia'",
    "Verificar que aparece un mensaje de validación indicando que la semilla es obligatoria",
    "Verificar que NO se realiza ninguna petición al servidor",
  ],
});

test("TREE-04 | Generación de árbol solo con título sin semilla", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Generar Árbol'",
    "Dejar el campo de semilla vacío",
    "Ingresar 'Mi árbol sin semilla' en el campo de título",
    "Hacer clic en 'Generar Árbol de la Ciencia'",
    "Verificar que aparece un error de validación, ya que la semilla es obligatoria",
  ],
});

test("TREE-05 | La visualización del árbol muestra nodos raíz, tronco y hojas", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Generar Árbol'",
    "Ingresar 'Redes neuronales profundas' como semilla",
    "Hacer clic en 'Generar Árbol de la Ciencia'",
    "Esperar a que el árbol sea generado",
    "Verificar que la visualización D3.js del árbol está renderizada",
    "Verificar que se pueden identificar nodos de tipo raíz (roots)",
    "Verificar que se pueden identificar nodos de tipo tronco (trunks)",
    "Verificar que se pueden identificar nodos de tipo hoja (leaves)",
    "Verificar que los nodos muestran información como título y año",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 2 — Descarga de árboles
// ──────────────────────────────────────────

test("TREE-06 | Descarga del árbol en formato JSON", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Generar Árbol' y generar un árbol con la semilla 'Bioinformática'",
    "Localizar el botón de descarga en formato JSON",
    "Hacer clic en 'Descargar JSON'",
    "Verificar que se descarga un archivo con extensión .json",
    "Verificar que el archivo descargado tiene contenido válido (no está vacío)",
  ],
});

test("TREE-07 | Descarga del árbol en formato PDF", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Generar Árbol' y generar un árbol con la semilla 'Nanotecnología'",
    "Localizar el botón de descarga en formato PDF",
    "Hacer clic en 'Descargar PDF'",
    "Verificar que se descarga un archivo con extensión .pdf",
    "Verificar que el archivo descargado tiene contenido y es mayor a 0 bytes",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 3 — Historial de árboles
// ──────────────────────────────────────────

test("TREE-08 | El historial muestra los árboles generados por el usuario", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Historial'",
    "Verificar que se muestra la lista de árboles generados por el usuario",
    "Verificar que cada árbol en el historial muestra: título, semilla y fecha de generación",
    "Verificar que cada árbol tiene disponibles opciones de descarga y eliminación",
  ],
});

test("TREE-09 | Búsqueda en el historial por título de árbol", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Historial'",
    "Ingresar 'Inteligencia artificial' en el campo de búsqueda",
    "Verificar que los resultados se filtran para mostrar solo árboles relacionados con 'Inteligencia artificial'",
    "Verificar que árboles no relacionados no aparecen en los resultados",
  ],
});

test("TREE-10 | Búsqueda en el historial por semilla", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Historial'",
    "Ingresar el texto de una semilla conocida en el campo de búsqueda",
    "Verificar que los árboles generados con esa semilla aparecen en los resultados",
  ],
});

test("TREE-11 | Historial vacío cuando el usuario no ha generado árboles", {
  steps: [
    "Iniciar sesión con un usuario nuevo que no ha generado ningún árbol",
    "Navegar a la sección 'Historial'",
    "Verificar que se muestra un mensaje de estado vacío indicando que no hay árboles generados",
  ],
});

test("TREE-12 | Paginación del historial funciona correctamente", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Historial' con un usuario que tiene más de 10 árboles generados",
    "Verificar que se muestra la primera página con el número correcto de elementos",
    "Navegar a la segunda página usando los controles de paginación",
    "Verificar que se cargan los árboles de la segunda página",
    "Verificar que los árboles de la primera página ya no están visibles",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 4 — Detalle y eliminación de árbol
// ──────────────────────────────────────────

test("TREE-13 | Ver detalle completo de un árbol desde el historial", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Historial'",
    "Hacer clic en un árbol de la lista para ver su detalle",
    "Verificar que se muestra el detalle completo: título, semilla, fecha, bibliografía",
    "Verificar que se muestran las estadísticas: roots, trunks, leaves, average_sap, max_sap, min_sap",
    "Verificar que la visualización del árbol está disponible",
  ],
});

test("TREE-14 | Descarga de árbol en CSV desde el historial", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Historial'",
    "Localizar un árbol en la lista",
    "Hacer clic en el botón de descarga CSV de ese árbol",
    "Verificar que se descarga un archivo con extensión .csv",
  ],
});

test("TREE-15 | Eliminación de un árbol con confirmación", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Historial'",
    "Hacer clic en el botón de eliminar de un árbol de la lista",
    "Verificar que aparece un diálogo de confirmación antes de eliminar",
    "Confirmar la eliminación",
    "Verificar que el árbol desaparece del historial",
    "Verificar que aparece un mensaje de éxito",
  ],
});

test("TREE-16 | Cancelar la eliminación mantiene el árbol en el historial", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Historial'",
    "Hacer clic en el botón de eliminar de un árbol",
    "En el diálogo de confirmación, hacer clic en 'Cancelar'",
    "Verificar que el árbol permanece en la lista sin ser eliminado",
  ],
});

test("TREE-17 | Usuario no puede acceder al árbol de otro usuario", {
  steps: [
    ...loginStep,
    "Intentar acceder directamente a /trees/ID_DE_ARBOL_DE_OTRO_USUARIO",
    "Verificar que el servidor responde con error 403 o 404",
    "Verificar que el árbol no es visible para este usuario",
  ],
});