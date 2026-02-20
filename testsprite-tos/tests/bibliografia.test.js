// tests/03_bibliografia.test.js
// ─────────────────────────────────────────────────────────────
// Flujos de gestión de bibliografías: subida, descarga y
// eliminación de archivos. Formatos: PDF, DOC, DOCX, TXT.
// ─────────────────────────────────────────────────────────────

import { test, expect } from "testsprite";

// ──────────────────────────────────────────
// Precondición general: usuario autenticado
// ──────────────────────────────────────────

const loginStep = [
  "Navegar a http://localhost:5173",
  "Iniciar sesión con 'usuario.test@unal.edu.co' y 'UserPass123!'",
  "Verificar que el dashboard está visible",
];

// ──────────────────────────────────────────
// BLOQUE 1 — Subida de archivos
// ──────────────────────────────────────────

test("BIB-01 | Subida exitosa de un archivo PDF", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Verificar que la sección de bibliografía está visible con el área de carga de archivos",
    "Subir el archivo 'bibliografia_prueba.pdf' usando el botón 'Seleccionar Archivo'",
    "Verificar que aparece una barra de progreso o indicador de carga",
    "Verificar que el archivo aparece en la lista de bibliografías del usuario",
    "Verificar que se muestra el nombre del archivo correctamente",
  ],
});

test("BIB-02 | Subida exitosa de un archivo DOCX", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Subir el archivo 'referencias.docx' usando el botón 'Seleccionar Archivo'",
    "Verificar que el archivo aparece en la lista de bibliografías",
  ],
});

test("BIB-03 | Subida exitosa de un archivo TXT", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Subir el archivo 'referencias.txt' usando el botón 'Seleccionar Archivo'",
    "Verificar que el archivo aparece en la lista de bibliografías",
  ],
});

test("BIB-04 | Subida por arrastrar y soltar (drag and drop)", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Arrastrar y soltar el archivo 'bibliografia_prueba.pdf' sobre el área de carga",
    "Verificar que el área de carga acepta el archivo (cambio visual al arrastrar)",
    "Verificar que el archivo aparece en la lista de bibliografías tras soltarlo",
  ],
});

test("BIB-05 | Rechazo de archivo con formato no permitido", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Intentar subir un archivo con extensión no permitida, como 'datos.exe'",
    "Verificar que aparece un mensaje de error indicando que el tipo de archivo no está permitido",
    "Verificar que el archivo NO aparece en la lista de bibliografías",
  ],
});

test("BIB-06 | Rechazo de archivo con tamaño excesivo", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Intentar subir un archivo que supere el límite de tamaño permitido",
    "Verificar que aparece un mensaje de error sobre el tamaño del archivo",
    "Verificar que el archivo NO se sube al servidor",
  ],
});

test("BIB-07 | Subida sin archivo seleccionado (botón vacío)", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Hacer clic en el botón 'Seleccionar Archivo' y cerrar el selector sin elegir ningún archivo",
    "Verificar que no se realiza ninguna petición de subida al servidor",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 2 — Listado de bibliografías
// ──────────────────────────────────────────

test("BIB-08 | Lista de bibliografías carga correctamente", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Verificar que la lista de bibliografías del usuario se carga correctamente",
    "Verificar que se muestra el nombre de cada archivo",
    "Verificar que cada archivo tiene disponibles los botones de descarga y eliminación",
  ],
});

test("BIB-09 | Estado vacío cuando el usuario no tiene bibliografías", {
  steps: [
    "Iniciar sesión con un usuario nuevo sin ninguna bibliografía subida",
    "Navegar a la sección 'Bibliografía'",
    "Verificar que se muestra un estado vacío o mensaje indicando que no hay bibliografías cargadas",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 3 — Descarga de bibliografías
// ──────────────────────────────────────────

test("BIB-10 | Descarga exitosa de un archivo de bibliografía", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Localizar un archivo en la lista de bibliografías",
    "Hacer clic en el botón de descarga del archivo",
    "Verificar que el archivo se descarga correctamente en el navegador",
    "Verificar que el nombre del archivo descargado coincide con el original",
  ],
});

// ──────────────────────────────────────────
// BLOQUE 4 — Eliminación de bibliografías
// ──────────────────────────────────────────

test("BIB-11 | Eliminación de una bibliografía con confirmación", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Hacer clic en el botón de eliminar de un archivo de la lista",
    "Verificar que aparece un diálogo de confirmación antes de eliminar",
    "Confirmar la eliminación",
    "Verificar que el archivo desaparece de la lista",
    "Verificar que aparece un mensaje de éxito tras la eliminación",
  ],
});

test("BIB-12 | Cancelación de eliminación mantiene el archivo", {
  steps: [
    ...loginStep,
    "Navegar a la sección 'Bibliografía'",
    "Hacer clic en el botón de eliminar de un archivo",
    "En el diálogo de confirmación, hacer clic en 'Cancelar'",
    "Verificar que el archivo permanece en la lista sin ser eliminado",
  ],
});

test("BIB-13 | Usuario no puede ver ni eliminar bibliografías de otro usuario", {
  steps: [
    ...loginStep,
    "Intentar acceder directamente a /bibliography/download/ID_DE_OTRO_USUARIO",
    "Verificar que el servidor responde con un error 403 o 404",
    "Intentar acceder directamente a /bibliography/delete/ID_DE_OTRO_USUARIO",
    "Verificar que el servidor responde con un error 403 o 404",
  ],
});