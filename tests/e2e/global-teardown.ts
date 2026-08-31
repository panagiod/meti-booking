import { cleanupE2EData, disconnectDb } from "../helpers/db";

// Limpieza final: SOLO usuarios e2e.* y sus datos. Nunca otros registros.
export default async function globalTeardown() {
  console.log("[global-teardown] Limpiando datos de prueba...");
  try {
    await cleanupE2EData();
  } finally {
    await disconnectDb();
  }
}
