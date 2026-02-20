// testsprite.config.js — Árbol de la Ciencia UNAL
export default {
  baseUrl: "http://localhost:5173",
  apiUrl: "http://localhost:8000",
  browser: "chromium",           // chromium | firefox | webkit
  headless: true,
  outputDir: "./test-results",
  screenshotsOnFailure: true,
  timeout: 30000,                // 30 segundos por paso
  retries: 1,

  // Credenciales de prueba — reemplaza con valores reales del entorno de test
  testUsers: {
    admin: {
      email: "secastrob@unal.edu.co",
      password: "sergio1003",
    },
    regular: {
      email: "serujio57@unal.edu.co",
      password: "SERGIO1003",
    },
  },
};