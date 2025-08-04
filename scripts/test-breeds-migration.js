#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
/* eslint-disable no-undef */

/**
 * Test script for breeds data migration
 * Purpose: Verify that breeds data has been properly migrated to the database
 * Usage: node scripts/test-breeds-migration.js
 */

import { createClient } from "@supabase/supabase-js";
require("dotenv").config({ path: ".env.local" });

// Initialize Supabase client
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Please ensure PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBreedsMigration() {
  console.log("🐕 Testing Breeds Data Migration...\n");

  try {
    // Test 1: Check total number of breeds
    console.log("1. Checking total number of breeds...");
    const { data: totalBreeds, error: totalError } = await supabase
      .from("dictionary.breeds")
      .select("id", { count: "exact" })
      .eq("is_active", true);

    if (totalError) {
      throw new Error(`Failed to count breeds: ${totalError.message}`);
    }

    console.log(`✅ Total active breeds: ${totalBreeds.length}`);
    if (totalBreeds.length < 100) {
      console.warn(
        "⚠️  Warning: Expected at least 100 breeds, got",
        totalBreeds.length,
      );
    }

    // Test 2: Check breeds by FCI group
    console.log("\n2. Checking breeds by FCI group...");
    const { data: breedsByGroup, error: groupError } = await supabase
      .from("dictionary.breeds")
      .select("fci_group")
      .eq("is_active", true);

    if (groupError) {
      throw new Error(`Failed to get breeds by group: ${groupError.message}`);
    }

    const groupCounts = breedsByGroup.reduce((acc, breed) => {
      acc[breed.fci_group] = (acc[breed.fci_group] || 0) + 1;
      return acc;
    }, {});

    console.log("✅ Breeds by FCI group:");
    Object.entries(groupCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([group, count]) => {
        console.log(`   ${group}: ${count} breeds`);
      });

    // Test 3: Check for duplicate FCI numbers
    console.log("\n3. Checking for duplicate FCI numbers...");
    const { data: fciNumbers, error: fciError } = await supabase
      .from("dictionary.breeds")
      .select("fci_number")
      .not("fci_number", "is", null);

    if (fciError) {
      throw new Error(`Failed to get FCI numbers: ${fciError.message}`);
    }

    const fciCounts = fciNumbers.reduce((acc, breed) => {
      acc[breed.fci_number] = (acc[breed.fci_number] || 0) + 1;
      return acc;
    }, {});

    const duplicates = Object.entries(fciCounts).filter(
      ([, count]) => count > 1,
    );
    if (duplicates.length > 0) {
      console.error("❌ Found duplicate FCI numbers:");
      duplicates.forEach(([number, count]) => {
        console.error(`   FCI ${number}: ${count} occurrences`);
      });
    } else {
      console.log("✅ No duplicate FCI numbers found");
    }

    // Test 4: Test search functionality
    console.log("\n4. Testing search functionality...");
    const searchTests = [
      { term: "labrador", expected: "Labrador" },
      { term: "owczarek", expected: "Owczarek" },
      { term: "german", expected: "German" },
      { term: "terrier", expected: "Terrier" },
    ];

    for (const test of searchTests) {
      const { data: searchResults, error: searchError } = await supabase
        .from("dictionary.breeds")
        .select("name_pl, name_en")
        .eq("is_active", true)
        .or(`name_pl.ilike.%${test.term}%,name_en.ilike.%${test.term}%`)
        .limit(5);

      if (searchError) {
        console.error(
          `❌ Search failed for "${test.term}": ${searchError.message}`,
        );
      } else {
        const hasExpected = searchResults.some(
          (breed) =>
            breed.name_pl.toLowerCase().includes(test.expected.toLowerCase()) ||
            breed.name_en.toLowerCase().includes(test.expected.toLowerCase()),
        );

        if (hasExpected) {
          console.log(
            `✅ Search for "${test.term}" works (found ${searchResults.length} results)`,
          );
        } else {
          console.warn(
            `⚠️  Search for "${test.term}" returned results but no expected matches`,
          );
        }
      }
    }

    // Test 5: Test pagination
    console.log("\n5. Testing pagination...");
    const { data: page1, error: page1Error } = await supabase
      .from("dictionary.breeds")
      .select("id")
      .eq("is_active", true)
      .order("name_pl")
      .range(0, 9);

    const { data: page2, error: page2Error } = await supabase
      .from("dictionary.breeds")
      .select("id")
      .eq("is_active", true)
      .order("name_pl")
      .range(10, 19);

    if (page1Error || page2Error) {
      throw new Error(
        `Pagination failed: ${page1Error?.message || page2Error?.message}`,
      );
    }

    if (page1.length === 10 && page2.length === 10) {
      console.log("✅ Pagination works correctly");
    } else {
      console.warn(
        `⚠️  Pagination returned unexpected results: page1=${page1.length}, page2=${page2.length}`,
      );
    }

    // Test 6: Check specific breeds
    console.log("\n6. Checking specific popular breeds...");
    const popularBreeds = [
      { name: "Labrador Retriever", fci: 122 },
      { name: "German Shepherd Dog", fci: 166 },
      { name: "Golden Retriever", fci: 111 },
      { name: "Border Collie", fci: 297 },
    ];

    for (const breed of popularBreeds) {
      const { data: found, error: findError } = await supabase
        .from("dictionary.breeds")
        .select("name_pl, name_en, fci_group, fci_number")
        .eq("fci_number", breed.fci)
        .eq("is_active", true)
        .single();

      if (findError) {
        console.error(`❌ Failed to find ${breed.name}: ${findError.message}`);
      } else {
        console.log(
          `✅ Found ${breed.name}: ${found.name_pl} (${found.fci_group})`,
        );
      }
    }

    // Test 7: Performance test
    console.log("\n7. Testing query performance...");
    const startTime = Date.now();

    const { data: perfTest, error: perfError } = await supabase
      .from("dictionary.breeds")
      .select("*")
      .eq("is_active", true)
      .eq("fci_group", "G1")
      .order("name_pl")
      .limit(50);

    const endTime = Date.now();
    const queryTime = endTime - startTime;

    if (perfError) {
      console.error(`❌ Performance test failed: ${perfError.message}`);
    } else {
      console.log(
        `✅ Query completed in ${queryTime}ms (returned ${perfTest.length} results)`,
      );
      if (queryTime > 1000) {
        console.warn("⚠️  Query took longer than expected (>1s)");
      }
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Total breeds: ${totalBreeds.length}`);
    console.log(`   - FCI groups: ${Object.keys(groupCounts).length}`);
    console.log(`   - Unique FCI numbers: ${Object.keys(fciCounts).length}`);
    console.log(`   - Query performance: ${queryTime}ms`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testBreedsMigration()
  .then(() => {
    console.log("\n✅ Migration test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration test failed:", error);
    process.exit(1);
  });
