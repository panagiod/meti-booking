import { cleanupE2EData, disconnectDb } from "../helpers/db";

// Purga defensiva: elimina usuarios e2e.* que hayan quedado de un run anterior
// (idempotente; solo toca usuarios de pruebas).
export default async function globalSetup() {
  console.log("[global-setup] Purga de usuarios e2e huérfanos...");
  await cleanupE2EData();
  await disconnectDb();
}
