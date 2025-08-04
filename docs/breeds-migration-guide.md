# Guide: Breeds Data Migration

## Overview

This guide provides step-by-step instructions for migrating the complete FCI dog breeds data from the breeds list to the Supabase database, replacing the current mock data with real data.

## Prerequisites

- Local Supabase instance running
- Node.js and npm installed
- Access to the project directory

## Files Created

1. **`supabase/migrations/20241221000000_populate_breeds_data.sql`** - Contains all FCI breeds data
2. **`supabase/migrations/20241221000001_add_breeds_indexes.sql`** - Performance indexes and constraints
3. **`scripts/test-breeds-migration.js`** - Test script for verification
4. **Updated `src/lib/services/breedService.ts`** - Now uses database instead of mock data

## Migration Steps

### Step 1: Stop Local Supabase

```bash
cd 10x-dog-show
supabase stop
```

### Step 2: Apply Migrations

```bash
# Start Supabase with new migrations
supabase start

# Verify migrations were applied
supabase db reset
```

### Step 3: Verify Data Migration

```bash
# Run the test script
node scripts/test-breeds-migration.js
```

Expected output:
```
🐕 Testing Breeds Data Migration...

1. Checking total number of breeds...
✅ Total active breeds: 150+

2. Checking breeds by FCI group...
✅ Breeds by FCI group:
   G1: 25+ breeds
   G2: 20+ breeds
   G3: 20+ breeds
   ...

3. Checking for duplicate FCI numbers...
✅ No duplicate FCI numbers found

4. Testing search functionality...
✅ Search for "labrador" works (found X results)
✅ Search for "owczarek" works (found X results)
...

🎉 All tests completed successfully!
```

### Step 4: Test API Endpoint

```bash
# Start the development server
npm run dev

# Test the breeds endpoint
curl "http://localhost:4321/api/breeds?limit=10"
```

Expected response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name_pl": "Akita",
      "name_en": "Akita",
      "fci_group": "G5",
      "fci_number": 255,
      "is_active": true,
      "created_at": "2024-12-21T...",
      "updated_at": "2024-12-21T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150+,
    "pages": 15+
  }
}
```

## Data Verification

### Check Database Directly

```sql
-- Connect to Supabase database
supabase db reset

-- Check total breeds
SELECT COUNT(*) FROM dictionary.breeds WHERE is_active = true;

-- Check breeds by group
SELECT fci_group, COUNT(*) 
FROM dictionary.breeds 
WHERE is_active = true 
GROUP BY fci_group 
ORDER BY fci_group;

-- Check specific breed
SELECT * FROM dictionary.breeds 
WHERE fci_number = 122; -- Labrador Retriever
```

### Test API Functionality

1. **Basic listing**: `GET /api/breeds`
2. **Filtering by FCI group**: `GET /api/breeds?fci_group=G1`
3. **Search**: `GET /api/breeds?search=labrador`
4. **Pagination**: `GET /api/breeds?page=2&limit=20`
5. **Combined filters**: `GET /api/breeds?fci_group=G8&search=retriever&page=1&limit=10`

## Performance Optimization

### Indexes Added

The migration includes the following performance indexes:

- `idx_breeds_fci_group` - For filtering by FCI group
- `idx_breeds_active_group` - Composite index for active breeds by group
- `idx_breeds_name_pl_search` - Full-text search for Polish names
- `idx_breeds_name_en_search` - Full-text search for English names
- `idx_breeds_fci_number` - For searching by FCI number
- `idx_breeds_name_pl_sort` - For sorting by Polish name
- `idx_breeds_name_en_sort` - For sorting by English name
- `idx_breeds_updated_at` - For sorting by update date

### Expected Performance

- **Query time**: < 200ms for standard queries
- **Search time**: < 100ms for text searches
- **Pagination**: < 50ms for paginated results

## Troubleshooting

### Common Issues

1. **Migration fails with duplicate key error**
   ```bash
   # Check for existing data
   supabase db reset
   # Re-run migration
   ```

2. **Test script fails to connect**
   ```bash
   # Check environment variables
   cat .env.local
   # Ensure PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
   ```

3. **API returns empty results**
   ```bash
   # Check if data was inserted
   supabase db reset
   # Verify table structure
   \d dictionary.breeds
   ```

4. **Performance issues**
   ```bash
   # Check if indexes were created
   \d+ dictionary.breeds
   # Look for indexes starting with idx_breeds_
   ```

### Rollback Plan

If migration fails, you can rollback:

```bash
# Stop Supabase
supabase stop

# Remove migration files
rm supabase/migrations/20241221000000_populate_breeds_data.sql
rm supabase/migrations/20241221000001_add_breeds_indexes.sql

# Restore original BreedService
git checkout HEAD -- src/lib/services/breedService.ts

# Restart Supabase
supabase start
```

## Data Quality Checks

### Validation Rules

1. **No duplicate FCI numbers** - Each FCI number should be unique
2. **Valid FCI groups** - Only G1-G10 are allowed
3. **Non-empty names** - Both Polish and English names required
4. **Proper encoding** - Polish characters should display correctly
5. **Active status** - All breeds should be active by default

### Quality Metrics

- **Total breeds**: 150+ (all major FCI breeds)
- **FCI groups covered**: All 10 groups (G1-G10)
- **Languages**: Polish and English names
- **FCI numbers**: 80%+ coverage of official numbers

## Next Steps

After successful migration:

1. **Update frontend components** to use real data
2. **Test all breed-related functionality**
3. **Monitor API performance** in production
4. **Consider adding breed images** in future iterations
5. **Implement breed search suggestions** for better UX

## Support

If you encounter issues:

1. Check the test script output for specific errors
2. Verify database connection and permissions
3. Review migration logs in Supabase dashboard
4. Check environment variables configuration
5. Consult the project documentation

## Migration Summary

- **Data source**: `breeds-list-from-perplexity.md`
- **Target table**: `dictionary.breeds`
- **Records added**: 150+ dog breeds
- **Performance**: Optimized with indexes
- **Testing**: Automated verification script
- **Rollback**: Available if needed 
