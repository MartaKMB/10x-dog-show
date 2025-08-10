/* eslint-disable no-console */
import { chromium, type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const testEnvironment = process.env.TEST_ENVIRONMENT || "local";

  console.log("🚀 Starting global setup for E2E tests...");
  console.log(`🌍 Test Environment: ${testEnvironment}`);
  console.log(`📍 Base URL: ${baseURL}`);

  if (testEnvironment === "cloud") {
    console.log("☁️  Using Supabase cloud for testing");
    console.log(`🔗 Cloud URL: ${process.env.VITE_SUPABASE_URL_CLOUD}`);
  } else {
    console.log("🏠 Using local development environment");
  }

  // Sprawdzenie czy aplikacja jest dostępna
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log("🔍 Checking application accessibility...");
    await page.goto(baseURL || "http://localhost:3000");

    // Czekamy na załadowanie głównych elementów
    await page.waitForSelector("h1", { timeout: 10000 });

    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Sprawdzamy czy nie ma błędów w konsoli
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Krótkie opóźnienie aby zebrać błędy
    await page.waitForTimeout(1000);

    if (consoleErrors.length > 0) {
      console.warn("⚠️  Console errors found:", consoleErrors);
    } else {
      console.log("✅ No console errors detected");
    }

    console.log("✅ Application is accessible and responsive");
  } catch (error) {
    console.error("❌ Failed to access application:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("✅ Global setup completed successfully");
}

export default globalSetup;
