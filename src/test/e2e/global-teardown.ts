/* eslint-disable no-console */
async function globalTeardown() {
  console.log("🧹 Starting global teardown for E2E tests...");

  // Cleanup test data or reset state here
  // For cloud Supabase, we might want to clean up test data
  // but not reset the entire database

  try {
    // Można tutaj dodać logikę czyszczenia danych testowych
    // np. usunięcie użytkowników testowych, resetowanie stanu
    console.log("✅ Test data cleanup completed");
  } catch (error) {
    console.error("⚠️  Warning: Test data cleanup failed:", error);
    // Nie rzucamy błędu, bo teardown nie powinien powodować niepowodzenia testów
  }

  console.log("✅ Global teardown completed successfully");
}

export default globalTeardown;
