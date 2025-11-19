# Batch 1: Database Foundation

**Estimated Time:** 1 hour
**Priority:** Critical
**Dependencies:** None

---

## 🎯 Objectives

1. Create `menus` table with proper constraints and indexes
2. Create `menu_items` table with hierarchical support
3. Set up RLS policies (admin-only CRUD)
4. Add comprehensive table/column comments
5. Generate TypeScript types
6. Test migrations in Supabase

---

## 📋 Prerequisites

- Supabase project is set up and accessible
- Database migrations folder exists: `supabase/migrations/`
- Supabase CLI or MCP server available for running migrations

---

## 🔨 Implementation Steps

### Step 1: Create Menus Table Migration

Create file: `supabase/migrations/YYYYMMDDHHMMSS_create_menus_table.sql`

**Migration naming:** Use current timestamp, e.g., `20251119120000_create_menus_table.sql`

**Full migration code:** See implementation section below.

### Step 2: Create Menu Items Table Migration

Create file: `supabase/migrations/YYYYMMDDHHMMSS_create_menu_items_table.sql`

**Migration naming:** Use timestamp 1 minute after menus table, e.g., `20251119120100_create_menu_items_table.sql`

**Full migration code:** See implementation section below.

### Step 3: Run Migrations

Using Supabase MCP server:
```sql
-- Verify migrations are ready
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;
```

Or using Supabase CLI:
```bash
supabase db push
```

### Step 4: Generate TypeScript Types

Run the type generation command:
```bash
pnpm run db:types
```

This will update `app/types/supabase.ts` with the new table definitions.

### Step 5: Verify Tables Exist

Using Supabase MCP server:
```sql
-- Check menus table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menus'
ORDER BY ordinal_position;

-- Check menu_items table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('menus', 'menu_items');
```

---

## 📝 Implementation Code

### Migration 1: Create Menus Table

**File:** `supabase/migrations/YYYYMMDDHHMMSS_create_menus_table.sql`

```sql
-- =====================================================
-- Dynamic Menus: Menus Table Migration
-- =====================================================
-- Description: Creates the menus table for managing
-- navigation menus with header/footer placement controls
-- Created: 2025-11-19
-- =====================================================

-- =====================================================
-- 1. CREATE MENUS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS menus (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Placement Controls
  show_in_header BOOLEAN NOT NULL DEFAULT false,
  show_in_footer BOOLEAN NOT NULL DEFAULT false,

  -- Status
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Ordering (for multiple menus in same location)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Flexible Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft Delete
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT at_least_one_location CHECK (show_in_header = true OR show_in_footer = true)
);

-- =====================================================
-- 2. ADD TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE menus IS 'Navigation menus with header/footer placement controls';
COMMENT ON COLUMN menus.id IS 'Unique identifier for the menu';
COMMENT ON COLUMN menus.name IS 'Display name of the menu (e.g., "Main Navigation")';
COMMENT ON COLUMN menus.slug IS 'URL-friendly identifier (e.g., "main-nav")';
COMMENT ON COLUMN menus.description IS 'Admin notes about the menu purpose';
COMMENT ON COLUMN menus.show_in_header IS 'Whether this menu appears in the header';
COMMENT ON COLUMN menus.show_in_footer IS 'Whether this menu appears in the footer';
COMMENT ON COLUMN menus.is_enabled IS 'Master on/off switch for the entire menu';
COMMENT ON COLUMN menus.display_order IS 'Order when multiple menus in same location';
COMMENT ON COLUMN menus.metadata IS 'Flexible JSONB for future extensibility';
COMMENT ON COLUMN menus.created_at IS 'Timestamp when menu was created';
COMMENT ON COLUMN menus.updated_at IS 'Timestamp when menu was last updated';
COMMENT ON COLUMN menus.created_by IS 'User who created the menu';
COMMENT ON COLUMN menus.updated_by IS 'User who last updated the menu';
COMMENT ON COLUMN menus.deleted_at IS 'Timestamp when menu was soft deleted (NULL if active)';

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Fast slug lookups
CREATE INDEX idx_menus_slug ON menus(slug)
  WHERE deleted_at IS NULL;

-- Fast header menu queries
CREATE INDEX idx_menus_header ON menus(show_in_header, display_order)
  WHERE deleted_at IS NULL AND is_enabled = true;

-- Fast footer menu queries
CREATE INDEX idx_menus_footer ON menus(show_in_footer, display_order)
  WHERE deleted_at IS NULL AND is_enabled = true;

-- JSONB metadata queries
CREATE INDEX idx_menus_metadata ON menus USING GIN(metadata);

-- =====================================================
-- 4. CREATE UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_menus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_menus_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW
  EXECUTE FUNCTION update_menus_updated_at();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Public read access for enabled menus
CREATE POLICY "Public can view enabled menus"
  ON menus FOR SELECT
  USING (deleted_at IS NULL AND is_enabled = true);

-- Admin full access (requires account_profiles.is_admin)
CREATE POLICY "Admins have full access to menus"
  ON menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM account_profiles
      WHERE account_profiles.id = auth.uid()
      AND account_profiles.is_admin = true
    )
  );
### Migration 2: Create Menu Items Table

**File:** `supabase/migrations/YYYYMMDDHHMMSS_create_menu_items_table.sql`

```sql
-- =====================================================
-- Dynamic Menus: Menu Items Table Migration
-- =====================================================
-- Description: Creates the menu_items table for managing
-- individual menu links with support for pages and custom URLs
-- Created: 2025-11-19
-- =====================================================

-- =====================================================
-- 1. CREATE MENU_ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_items (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,

  -- Link Configuration
  custom_url TEXT,
  label TEXT NOT NULL,
  description TEXT,

  -- Behavior
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,

  -- Ordering & Status
  display_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Flexible Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft Delete
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT link_source_required CHECK (
    (page_id IS NOT NULL AND custom_url IS NULL) OR
    (page_id IS NULL AND custom_url IS NOT NULL)
  ),
  CONSTRAINT unique_order_per_parent UNIQUE (menu_id, parent_id, display_order)
);

-- =====================================================
-- 2. ADD TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE menu_items IS 'Individual menu items with support for pages and custom URLs';
COMMENT ON COLUMN menu_items.id IS 'Unique identifier for the menu item';
COMMENT ON COLUMN menu_items.menu_id IS 'Reference to parent menu';
COMMENT ON COLUMN menu_items.parent_id IS 'Reference to parent item (NULL = top-level)';
COMMENT ON COLUMN menu_items.page_id IS 'Reference to page (mutually exclusive with custom_url)';
COMMENT ON COLUMN menu_items.custom_url IS 'Custom URL (mutually exclusive with page_id)';
COMMENT ON COLUMN menu_items.label IS 'Display text for the menu item';
COMMENT ON COLUMN menu_items.description IS 'Optional description (shown in dropdowns for child items)';
COMMENT ON COLUMN menu_items.open_in_new_tab IS 'Whether to open link in new tab';
COMMENT ON COLUMN menu_items.display_order IS 'Order within parent (0-indexed)';
COMMENT ON COLUMN menu_items.is_enabled IS 'Whether this item is visible';
COMMENT ON COLUMN menu_items.metadata IS 'Flexible JSONB for future extensibility';
COMMENT ON COLUMN menu_items.created_at IS 'Timestamp when item was created';
COMMENT ON COLUMN menu_items.updated_at IS 'Timestamp when item was last updated';
COMMENT ON COLUMN menu_items.created_by IS 'User who created the item';
COMMENT ON COLUMN menu_items.updated_by IS 'User who last updated the item';
COMMENT ON COLUMN menu_items.deleted_at IS 'Timestamp when item was soft deleted (NULL if active)';

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Fast menu item queries by menu
CREATE INDEX idx_menu_items_menu_id ON menu_items(menu_id)
  WHERE deleted_at IS NULL;

-- Fast parent-child queries
CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id)
  WHERE deleted_at IS NULL;

-- Fast page reference lookups
CREATE INDEX idx_menu_items_page_id ON menu_items(page_id)
  WHERE deleted_at IS NULL;

-- Fast ordering queries
CREATE INDEX idx_menu_items_order ON menu_items(menu_id, parent_id, display_order)
  WHERE deleted_at IS NULL;

-- JSONB metadata queries
CREATE INDEX idx_menu_items_metadata ON menu_items USING GIN(metadata);

-- =====================================================
-- 4. CREATE UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_items_updated_at();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Public read access for enabled items in enabled menus
CREATE POLICY "Public can view enabled menu items"
  ON menu_items FOR SELECT
  USING (
    deleted_at IS NULL
    AND is_enabled = true
    AND EXISTS (
      SELECT 1 FROM menus
      WHERE menus.id = menu_items.menu_id
      AND menus.deleted_at IS NULL
      AND menus.is_enabled = true
    )
  );

-- Admin full access
CREATE POLICY "Admins have full access to menu items"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM account_profiles
      WHERE account_profiles.id = auth.uid()
      AND account_profiles.is_admin = true
    )
  );
```

---

## 🧪 Testing Instructions

### Test 1: Verify Tables Created

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('menus', 'menu_items');

-- Expected: 2 rows (menus, menu_items)
```

### Test 2: Verify Constraints

```sql
-- Check menus constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'menus';

-- Expected: PRIMARY KEY, CHECK (valid_slug_format), CHECK (at_least_one_location)

-- Check menu_items constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'menu_items';

-- Expected: PRIMARY KEY, FOREIGN KEYs, CHECK (link_source_required), UNIQUE (unique_order_per_parent)
```

### Test 3: Test Insert Menu

```sql
-- Insert test menu
INSERT INTO menus (name, slug, show_in_header, is_enabled)
VALUES ('Test Menu', 'test-menu', true, true)
RETURNING *;

-- Expected: Success with auto-generated id, timestamps
```

### Test 4: Test Slug Validation

```sql
-- Try invalid slug (should fail)
INSERT INTO menus (name, slug, show_in_header)
VALUES ('Bad Menu', 'Bad_Menu!', true);

-- Expected: ERROR - violates check constraint "valid_slug_format"
```

### Test 5: Test Location Constraint

```sql
-- Try menu with no location (should fail)
INSERT INTO menus (name, slug, show_in_header, show_in_footer)
VALUES ('No Location', 'no-location', false, false);

-- Expected: ERROR - violates check constraint "at_least_one_location"
```

### Test 6: Test Menu Item with Page Reference

```sql
-- Get a published page ID first
SELECT id, title FROM pages WHERE status = 'published' LIMIT 1;

-- Insert menu item (replace <page-id> and <menu-id> with actual UUIDs)
INSERT INTO menu_items (menu_id, page_id, label, display_order)
VALUES ('<menu-id>', '<page-id>', 'Test Link', 0)
RETURNING *;

-- Expected: Success
```

### Test 7: Test Link Source Constraint

```sql
-- Try menu item with both page_id and custom_url (should fail)
INSERT INTO menu_items (menu_id, page_id, custom_url, label)
VALUES ('<menu-id>', '<page-id>', 'https://example.com', 'Bad Link');

-- Expected: ERROR - violates check constraint "link_source_required"

-- Try menu item with neither (should fail)
INSERT INTO menu_items (menu_id, label)
VALUES ('<menu-id>', 'No Link');

-- Expected: ERROR - violates check constraint "link_source_required"
```

### Test 8: Test RLS Policies

```sql
-- As public user (no auth), try to view enabled menu
SELECT * FROM menus WHERE is_enabled = true;

-- Expected: Success (public can view enabled menus)

-- As public user, try to insert menu
INSERT INTO menus (name, slug, show_in_header)
VALUES ('Unauthorized', 'unauthorized', true);

-- Expected: ERROR - new row violates row-level security policy
```

### Test 9: Verify Indexes

```sql
-- Check indexes on menus
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'menus';

-- Expected: idx_menus_slug, idx_menus_header, idx_menus_footer, idx_menus_metadata

-- Check indexes on menu_items
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'menu_items';

-- Expected: idx_menu_items_menu_id, idx_menu_items_parent_id, idx_menu_items_page_id,
--           idx_menu_items_order, idx_menu_items_metadata
```

### Test 10: Clean Up Test Data

```sql
-- Delete test data
DELETE FROM menu_items WHERE menu_id IN (SELECT id FROM menus WHERE slug = 'test-menu');
DELETE FROM menus WHERE slug = 'test-menu';
```

---

## ✅ Success Criteria

- [ ] Both tables created successfully
- [ ] All constraints working (slug format, location, link source)
- [ ] All indexes created
- [ ] RLS policies active (public read, admin full access)
- [ ] Triggers working (updated_at auto-updates)
- [ ] TypeScript types generated
- [ ] All test queries pass

---

## 🚀 Next Steps

Once all tests pass, proceed to **Batch 2: Backend Repositories**

