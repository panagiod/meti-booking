import { cleanupE2EData, disconnectDb } from "../tests/helpers/db";

// Limpieza manual de usuarios e2e.* (solo datos de pruebas, nunca otros).
async function main() {
  console.log("[test-cleanup] Eliminando usuarios e2e.* de la DB de pruebas...");
  const deleted = await cleanupE2EData();
  await disconnectDb();
  console.log(`[test-cleanup] Completado (${deleted} usuarios eliminados).`);
}

main();
